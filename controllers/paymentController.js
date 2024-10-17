import Razorpay from 'razorpay'
import { Order } from '../models/orderModel.js'
import { Restaurant } from '../models/restaurantModel.js';

export const createPayment = async (req, res) => {
  try {

    const { menuItems, totalPrice, deliveryFee, taxRate, grandTotal, restaurant } = req.body

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(grandTotal * 100), // Amount in paise
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await instance.orders.create(options)
    
    //fetch restaurant
    const restaurantData = await Restaurant.findById(restaurant).populate('name location')

    // Save the order details to the database
    const newOrder = new Order({
      orderId: order.id,
      userId: req.user.id, // Assuming user is authenticated and available in req.user
      menuItems,
      restaurant: restaurantData,
      totalPrice,
      deliveryFee,
      grandTotal,
      taxRate,
      receipt: order.receipt,  
    })

    await newOrder.save()

    res.status(200).json({ orderId: order.id })
  } catch (error) {
    console.error("Error creating Razorpay order:", error)
    res.status(500).json({  error })
  }
}

export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id //User ID from the authenticated request
    // const userRole = req.user.role;
    
    // // Only allow users with role 'user' to fetch their own orders
    // if (userRole !== 'user') {
    //   return res.status(403).json({ message: "Access denied. Only regular users can view orders." });
    // }

    // Extract page and limit from query parameters, with default values
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const limit = parseInt(req.query.limit) || 5; // Default to 10 orders per page if not provided

    // Calculate the number of orders to skip
    const skip = (page - 1) * limit;

    // Fetch orders from the database where the user is the owner
    const orders = await Order.find({ user: userId })
      .populate('menuItems')  // Assuming menuItems is populated with references
      .populate('restaurant')
      .sort({ createdAt: -1 }) // Sort by most recent order first
      .skip(skip)
      .limit(limit)
      .exec();

    // Get the total number of orders for the user
    const totalOrders = await Order.countDocuments({ user: userId });

    // If no orders found
    if (!totalOrders || totalOrders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user." });
    }
    
    // Return orders with pagination details
    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit), // Calculate the total number of pages
      totalOrders,
      orders: orders.map(order => ({
        orderId: order._id,
        status: order.status,
        restaurant: {
          name: order.restaurant ? order.restaurant.name : "Unknown",
          location: order.restaurant ? order.restaurant.location : "Unknown",
        },
        menuItems: order.menuItems.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          veg: item.veg,
          id: item.id
        })),
        grandTotal: order.grandTotal,
        deliveryFee: order.deliveryFee,
        taxRate: order.taxRate,
        createdAt: order.createdAt,
        paymentMethod: order.paymentMethod // If payment method (e.g., Razorpay) is saved
      }))
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

