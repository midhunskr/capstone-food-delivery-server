import mongoose from "mongoose"

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    restaurant: {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Restaurant',
          required: true
        },
        name: String,
        location: String
    },
    restaurantLocation: {type: String},
    menuItems: [{
        menuItem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Menu',
            required: true
        },
        name: String,
        price: Number,
        image: String,
        veg: Boolean,
        quantity: {
            type: Number,
            required: true
        },
    }],
    totalPrice: { type: Number},
    deliveryPerson: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
        type: String, enum: ['pending', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'],
        default: 'pending'
    },
    deliveryAddress: {type: String},
    deliveryFee: { type: Number },
    taxRate: { type: Number }
    },
    { timestamps: true }
)

export const Order = mongoose.model('Order', orderSchema)