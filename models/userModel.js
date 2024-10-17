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

const userSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minLength: 6 },
    role: { type: String, enum: ['user', 'delivery', 'admin'], default: 'user' },
    phone: { type: String },
    addresses: [addressSchema],
}, { timestamps: true }
)

export const User = mongoose.model('User', userSchema)