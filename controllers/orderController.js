
import { Order } from "../models/orderModel.js";
import { Restaurant } from "../models/restaurantModel.js";
import { User } from "../models/userModel.js";

export const createOrder = async (req, res) => {
  try {
    const { menuItems, restaurantId, deliveryFee, taxRate, deliveryAddress, status } = req.body;
    const userId = req.user.id;

    // Fetch the user's name from database
    const user = await User.findById(userId).select("name");
    const userName = user ? user.name : "Unknown User";

    const restaurant = await Restaurant.findById(restaurantId);
      
    if (!restaurant) {
      return res.status(404).json({ success: false, message: "Restaurant not found" });
    }

    if (!restaurant.menuItems || restaurant.menuItems.length === 0) {
      return res.status(400).json({ success: false, message: "The restaurant has no menu items available." });
    }

    const selectedMenuItems = [];
    let totalPrice = 0;

    for (const item of menuItems) {
      const menuItem = restaurant.menuItems.find(m => m._id.equals(item.menuItemId));
      if (!menuItem) {
        return res.status(404).json({ success: false, message: `Menu item with ID ${item.menuItemId} not found in restaurant` });
      }      
      
      const itemTotal = menuItem.price * item.quantity;
      totalPrice += itemTotal;
      selectedMenuItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        image: menuItem.image,
        veg: menuItem.veg,
        quantity: item.quantity,
        total: itemTotal
      });
    }

    totalPrice += deliveryFee || 0;
    totalPrice += taxRate ? totalPrice * taxRate : 0;

    const order = new Order({
      user: userId,
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        location: restaurant.location
      },
      menuItems: selectedMenuItems,
      totalPrice,
      deliveryFee,
      taxRate,
      deliveryAddress,
      status
    });

    console.log(order);
    

    const createdOrder = await order.save();
    
    res.status(201).json({
      success: true,
      message: `Order created successfully by '${userName}' for '${restaurant.name}'`,
      order: createdOrder,
      location: restaurant.location
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, message: "Server error, failed to create order." });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    // Find orders for the logged-in user and populate restaurant, user, and menu items (with name, price, and image)
    const orders = await Order.find({ user: req.user.id })
      .populate('restaurant', 'name') // Populate restaurant name
      .populate({
        path: 'menuItems.menuItem', // Populate menu items within the order
        select: 'name price image'  // Ensure only relevant fields are fetched from the Menu model
      })
      .populate("user", "name email"); // Populate user data

    if (!orders || orders.length === 0) {
      return res.status(404).json({ success: false, message: 'No orders found for this user.' });
    }

    res.status(200).json({
      success: true,
      total_orders: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error, unable to retrieve orders.' });
  }
};


// Get all orders (Admin access only)
export const getAllOrdersAdmin = async (req, res) => {
  try {
    // Fetch all orders, populating user and restaurant details
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("restaurant", "name location")

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error, unable to fetch orders.",
    });
  }
};

//Get order by Id
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("restaurant", "name location");

    // Error handling for order not found
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    // Allow only the user who placed the order or an admin to view the order
    if (
      req.user.role !== "admin" &&
      order.user._id.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied." });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error, unable to fetch order.",
    });
  }
};

//Delete order by Id (Admin)
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    const restaurant = await Restaurant.findById(order.restaurant);
    res.json({
      success: true,
      message: `Order has been deleted from '${restaurant.name}' successfully!`,
      order,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error, order not found" });
  }
};
