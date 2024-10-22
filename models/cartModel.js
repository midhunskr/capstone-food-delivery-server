import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant", // Assuming you have a MenuItem model
    required: true
  },
  name: { type: String, required: true },
  veg: { type: Boolean, default: true },
  price: { type: Number, required: true },
  image: { type: String },
  quantity: { type: Number, required: true, default: 1 },
  total: { type: Number, required: true }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  restaurant: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
    },
    name: { type: String },
    location: { type: String }
  },
  cartItems: [cartItemSchema],
  totalPrice: { type: Number, required: true, default: 0 },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Cart = mongoose.model("Cart", cartSchema);
