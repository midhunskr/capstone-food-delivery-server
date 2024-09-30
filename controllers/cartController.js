
import { Cart } from "../models/cartModel.js";
import { Restaurant } from "../models/restaurantModel.js";

// Create or update cart
export const updateCart = async (req, res) => {
  try {
    const { menuItems, restaurantId } = req.body;
    const userId = req.user.id;

    console.log(menuItems);
    

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({ success: false, message: "Restaurant not found" });
    }

    let cart = await Cart.findOne({ user: userId, "restaurant.id": restaurantId });

    // If no cart exists, create a new one
    if (!cart) {
      cart = new Cart({
        user: userId,
        restaurant: {
          id: restaurant._id,
          name: restaurant.name,
          location: restaurant.location
        },
        cartItems: [],
        totalPrice: 0
      });
    }

    let totalPrice = 0;

    for (const item of menuItems) {
      const existingItem = cart.cartItems.find(i => i.menuItem.equals(item.menuItemId));
      const menuItem = restaurant.menuItems.find(m => m._id.equals(item.menuItemId)); 

      if (!menuItem) {
        return res.status(404).json({ success: false, message: `Menu item with ID ${item.menuItemId} not found` });
      }

      if (existingItem) {
        existingItem.quantity += item.quantity;
        existingItem.total = existingItem.quantity * menuItem.price;
      } else {
        const itemTotal = menuItem.price * item.quantity;
        cart.cartItems.push({
          menuItem: menuItem._id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: item.quantity,
          total: itemTotal
        });
      }

      totalPrice += menuItem.price * item.quantity;
    }

    cart.totalPrice = totalPrice;

    const updatedCart = await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart: updatedCart
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ success: false, message: "Server error, failed to update cart." });
  }
}

// Get cart for logged-in user
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate("cartItems", "name price image")
      // .populate("restaurant.id", "name location");
      .populate("user", "name, email" )

    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
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
