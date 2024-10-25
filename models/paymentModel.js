import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true},
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true},
    total: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
    customerName: { type: String}, // Ensure this is defined
    customerAddress: { 
        type: Object, // or a specific shape if you have one
        required: true
    },
    },
    { timestamps: true }
)

export const Payment = mongoose.model('Payment', paymentSchema)