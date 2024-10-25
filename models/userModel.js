import mongoose from "mongoose"

const addressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    street: {
        type: String,
    },
    city: {
        type: String,
    },
    zip: {
        type: String, // Or Number, depending on your use case
    },
    state: {
        type: String,
    },
    country: {
        type: String,
    },
    isDefault: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

// Rating Schema
const ratingSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 0.5,
        max: 5,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const userSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minLength: 6 },
    role: { type: String, enum: ['user', 'delivery', 'admin'], default: 'user' },
    phone: { type: String },
    addresses: [addressSchema],
    ratings: [ratingSchema],
}, { timestamps: true }
)

export const User = mongoose.model('User', userSchema)