
import { Cart } from "../models/cartModel.js";
import { Restaurant } from "../models/restaurantModel.js";

export const updateCart = async (req, res) => {
  try {
    const { menuItems, restaurantId } = req.body;
    const userId = req.user.id; 
    
    // Check if the restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: "Restaurant not found." });
    }

    // Filter out items with quantity <= 0
    const validMenuItems = menuItems.filter(item => item.quantity > 0);  

    // Handle case where no valid items are left in the cart
    if (validMenuItems.length === 0) {
      // Clear the cart if no valid items
      await Cart.findOneAndUpdate(
        { user: userId, "restaurant.id": restaurantId },
        { $set: { cartItems: [], totalPrice: 0 } },
        { new: true }
      );
      return res.status(200).json({ success: true, message: "Cart cleared successfully", cart: [] }); // Return an empty cart array
    }

    // Create an array to hold the updates (valid items only)
    const updates = validMenuItems.map(item => {
      const menuItem = restaurant.menuItems.find(m => m._id.equals(item.menuItemId));   
      
      if (!menuItem) {
        throw new Error(`Menu item with ID ${item.menuItemId} not found in restaurant ${restaurant.name}.`);
      }
      return {
        menuItem: menuItem._id,
        name: menuItem.name,
        veg: menuItem.veg,
        price: menuItem.price,
        image: menuItem.image1,
        quantity: item.quantity,
        total: menuItem.price * item.quantity
      };
    });

    // Try to find and update the cart
    let cart = await Cart.findOneAndUpdate(
      { user: userId, "restaurant.id": restaurantId },
      { 
        $set: {
          cartItems: updates, 
          totalPrice: updates.reduce((acc, item) => acc + item.total, 0)
        } 
      },
      { new: true, runValidators: true }
    );

    // If cart does not exist, create a new one
    if (!cart) {
      const newCart = new Cart({
        user: userId,
        restaurant: {
          id: restaurant._id,
          name: restaurant.name,
          location: restaurant.location
        },
        cartItems: updates,
        totalPrice: updates.reduce((acc, item) => acc + item.total, 0)
      });
      cart = await newCart.save();
      return res.status(200).json({ success: true, message: "Cart created successfully", cart });
    }
    
    // Return the updated cart
    res.status(200).json({ success: true, message: "Cart updated successfully", cart });

  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ success: false, message: "Server error, failed to update cart." });
  }
};

export const getCart = async (req, res) => {
  try {
    const { restaurantId } = req.query; // Assuming restaurantId is passed as a query parameter

    if (!restaurantId) {
      return res.status(400).json({ success: false, message: "Restaurant ID is required." });
    }

    const cart = await Cart.findOne({ user: req.user.id, "restaurant.id": restaurantId })
      .populate("user", "name email")
      // Add other populate options here as needed
      .populate("cartItems", "name price image");

    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found for this restaurant." });
    }

    res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ success: false, message: "Server error, failed to fetch cart." });
  }
};


// Clear cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOneAndDelete({ user: userId });

    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully"
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ success: false, message: "Server error, failed to clear cart." });
  }
};
