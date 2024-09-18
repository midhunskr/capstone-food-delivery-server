import mongoose from "mongoose"

const menuItemSchema = new mongoose.Schema({
    name: {type: String, required: true},
    description: {type: String},
    price: {type: Number, required: true},
    restaurant: {type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true},
    image: {type: String}, //Cloudinary Image URL
    availability: {type: Boolean, default: true}
    },
    {timestamps: true}
)

export const Menu = mongoose.model('Menu', menuItemSchema)