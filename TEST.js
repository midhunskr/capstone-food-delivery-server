//Multer config
    import multer from 'multer'

    const storage = multer.diskStorage({
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
    })
    
    export const upload = multer({ storage: storage })

//Cloudinary config
    import { v2 as cloudinary } from 'cloudinary'

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUD_NAME, 
        api_key: process.env.API_KEY, 
        api_secret: process.env.API_SECRET // Click 'View API Keys' above to copy your API secret
    })

    export const cloudinaryInstance = cloudinary

//Restaurant schema & model
    import mongoose from "mongoose"

    const menuItemSchema = new mongoose.Schema({
        name: { type: String, required: true },
        price: { type: Number, required: true },
        description: { type: String, required: true },
        available: { type: Boolean, default: true },
    });

    const restaurantSchema = new mongoose.Schema({
        name: { type: String, required: true },
        description: { type: String, required: true },
        location: { type: String, required: true },
        phone: { type: String },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        menuItems: [menuItemSchema]
        },
        { timestamps: true }
    )

    export const Restaurant = mongoose.model('Restaurant', restaurantSchema)

//Restaurant controller
    import { Restaurant } from "../models/restaurantModel.js";
    import { cloudinaryInstance } from "../config/cloudinary.js";

    // Create a restaurant
    export const createRestaurant = async (req, res) => {
        try {
            // Import and assign required fields from req.body to variables
            const { name, description, location, menuItems } = req.body;

            // Error handling for restaurant existence
            let restaurantExist = await Restaurant.findOne({ name, description, location });
            if (restaurantExist) {
                return res.status(400).json({ success: false, message: `Restaurant '${restaurantExist.name}' already exists at '${restaurantExist.location}' with the same 'description'!` });
            }

            // Process and upload images for each menu item
            let processedMenuItems = [];
            if (menuItems && Array.isArray(menuItems)) {
                for (const menuItem of menuItems) {
                    let uploadedMenuItemImage = null;

                    // Check if there's an image for this menu item
                    if (menuItem.image && req.files && req.files[menuItem.image]) {
                        try {
                            // Upload the image to Cloudinary
                            const imageFile = req.files[menuItem.image][0]; // Assuming single file upload per field
                            uploadedMenuItemImage = await cloudinaryInstance.uploader.upload(imageFile.path);
                        } catch (error) {
                            console.error(`Image upload failed for menu item ${menuItem.name}:`, error);
                            return res.status(500).json({ success: false, message: `Image upload failed for menu item ${menuItem.name}` });
                        }
                    }

                    // Add the menu item with the uploaded image URL to the processedMenuItems array
                    processedMenuItems.push({
                        name: menuItem.name,
                        price: menuItem.price,
                        description: menuItem.description,
                        image: uploadedMenuItemImage ? uploadedMenuItemImage.secure_url : '', // Store the Cloudinary image URL
                    });
                }
            }

            // Create new Restaurant
            const restaurant = new Restaurant({
                name,
                description,
                location,
                menuItems: processedMenuItems, // Corrected field name
                user: req.user._id
            });

            // Save restaurant data
            const createdRestaurant = await restaurant.save();

            // Success response
            res.status(201).json({
                success: true,
                message: `New restaurant '${createdRestaurant.name}' has been created successfully!`,
                data: createdRestaurant
            });

        } catch (error) {
            // Handle any errors that occur during the process
            console.error('Error:', error);
            res.status(500).json({
                success: false,
                message: 'Server Error: Could not create restaurant',
                error: error.message
            });
        }
    };

//Restaurant Route
    import express from 'express'
    import { admin, authUser } from '../../middlewares/authMiddleware.js'
    import { createRestaurant, deleteRestaurant, getRestaurant, getRestaurantById, updateRestaurant } from '../../controllers/restaurantController.js'
    import { upload } from '../../middlewares/uploadMiddleware.js'

    const router = express.Router()

    //Restaurant routes
    router.post('/create', authUser, admin, upload.fields([
        { name: 'menuItems[0].image', maxCount: 1 },
        { name: 'menuItems[1].image', maxCount: 1 },
        { name: 'menuItems[2].image', maxCount: 1 }
    ]), createRestaurant)
    router.get('/all-restaurants', authUser, getRestaurant)
    router.get('/:id', authUser, getRestaurantById)
    router.put('/:id', authUser, admin, updateRestaurant)
    router.delete('/:id', authUser, admin, deleteRestaurant)

    export default router