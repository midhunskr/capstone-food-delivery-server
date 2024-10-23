// import mongoose from "mongoose"

// const orderSchema = new mongoose.Schema({
//     user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//     },
//     restaurant: {
//         id: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: 'Restaurant',
//           required: true
//         },
//         name: String,
//         location: String
//     },
//     restaurantLocation: {type: String},
//     menuItems: [{
//         menuItem: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'Menu',
//             required: true
//         },
//         name: String,
//         price: Number,
//         image: String,
//         veg: Boolean,
//         quantity: {
//             type: Number,
//             required: true
//         },
//     }],
//     totalPrice: { type: Number},
//     deliveryPerson: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//     status: {
//         type: String, enum: ['pending', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'],
//         default: 'pending'
//     },
//     deliveryAddress: {type: String},
//     deliveryFee: { type: Number },
//     taxRate: { type: Number }
//     },
//     { timestamps: true }
// )

// export const Order = mongoose.model('Order', orderSchema)


import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  quantity: Number,
  image: String,
  veg: Boolean,
});

const orderSchema = new mongoose.Schema({
  razorpayOrderId: {
    type: String,
  },
  menuItems: [menuItemSchema], // Include menuItems in the order
  totalPrice: {
    type: Number,
  },
  userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant'
  },
  deliveryFee: {
    type: Number,
  },
  taxRate: {
    type: Number,
  },
  grandTotal: {
    type: Number,
  },
  status: {
    type: String,
    default: 'completed', // Order status can be 'pending', 'paid', etc.
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Order = mongoose.model('Order', orderSchema);

