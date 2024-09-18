import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minLength: 6 },
    role: { type: String, enum: ['user', 'delivery', 'admin'], default: 'user' },
    phone: { type: String },
}, { timestamps: true }
)

export const User = mongoose.model('User', userSchema)