
import { Restaurant } from "../models/restaurantModel.js";
import { cloudinaryInstance } from "../config/cloudinary.js";

// Create a restaurant
export const createRestaurant = async (req, res) => {
    try {
      const { name, description, location } = req.body;
  
      const menuItemKeys = Object.keys(req.body).filter(key => key.startsWith('menuItems'));
      const menuItemIndices = [...new Set(menuItemKeys.map(key => key.match(/\[(\d+)\]/)[1]))];

        const menuItems = await Promise.all(menuItemIndices.map(async (index) => {
        const itemName = req.body[`menuItems[${index}].name`];
        const itemPrice = parseFloat(req.body[`menuItems[${index}].price`]); // Convert to Number
        const itemDescription = req.body[`menuItems[${index}].description`];
        const itemVeg = req.body[`menuItems[${index}].veg`] === 'true'; // Convert to Boolean
        const itemRecommended = req.body[`menuItems[${index}].recommended`] === 'true'; // Convert to Boolean
        const itemCategory = req.body[`menuItems[${index}].category`];
        const itemImageFile = req.files[`menuItems[${index}].image`]?.[0];
      
        if (!itemName || !itemPrice || !itemCategory) {
          return null; // Skip incomplete items
        }
      
        let uploadedImage = null;
        if (itemImageFile) {
          try {
            uploadedImage = await cloudinaryInstance.uploader.upload(itemImageFile.path);
          } catch (error) {
            throw new Error(`Image upload failed for ${itemName}`);
          }
        }
           
        return {
          name: itemName,
          price: itemPrice,
          description: itemDescription || '', // Provide a default empty string if not available
          veg: itemVeg, // New field for veg
          recommended: itemRecommended, // New field for recommended
          category: itemCategory, // New field for category
          image: uploadedImage ? uploadedImage.secure_url : '',
          restaurantName: name, // Include restaurant name
          restaurantLocation: location
        };
      }));
        
      // Filter out null items
      const validMenuItems = menuItems.filter(item => item !== null);
  
      // Create the restaurant
      const restaurant = new Restaurant({
        name,
        description,
        location,
        menuItems: validMenuItems,
        user: req.user._id
      });
  
      const createdRestaurant = await restaurant.save();
  
      // Send the response
      res.status(201).json({
        success: true,
        message: `New restaurant '${createdRestaurant.name}' has been created successfully!`,
        data: createdRestaurant
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server Error: Could not create restaurant',
        error: error.message
      });
    }
};

//Get all restaurant
export const getRestaurant = async(req, res) =>{
    //Find restaurants and save to variable 'restaurants' and replace with populate('user, 'name') from Restaurant schema
    const restaurants = await Restaurant.find().populate('user', 'name')

    //Error handling
    if (restaurants){
        res.status(200).json({success: true, message: "All restaurants has been listed successfully!", restaurants})
        
    } else {
        res.status(404).json({success: false, message: 'Restaurant not found'})
    }
}

// Get restaurant by ID
export const getRestaurantById = async (req, res) => {
    //Find restaurant by Id and save to variable 'restaurants' and replace with populate('user, 'name') from Restaurant schema
    const restaurant = await Restaurant.findById(req.params.id).populate('user', 'name')

    if (restaurant) {
        res.status(200).json({success: true, message: "Restaurant '" + restaurant.name + "' listed successfully!", restaurant})
        
    } else {
        res.status(404).json({success: false, message: 'Restaurant not found' })
    }
}

export const getRestaurantByMenuItem = async (req, res) => {
  const { id } = req.body;

  try {
    // Find all restaurants
    const allRestaurants = await Restaurant.find(); // Fetch all restaurants

    // Filter restaurants based on id
    const restaurant = allRestaurants.find(restaurant =>
      restaurant.menuItems.some(item => item._id.toString() === id)
    );

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.status(200).json(restaurant); 
  } catch (error) {
    console.error("Error finding restaurant by menu item:", error);
    res.status(500).json({ message: "Server error" });
  }
};


//Update restaurant
export const updateRestaurant = async (req, res) => {
  try {
      const { id } = req.params;
      const { name, description, location } = req.body;

      // Fetch the restaurant to update
      const restaurant = await Restaurant.findById(id);
      if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

      // Update basic restaurant info
      restaurant.name = name || restaurant.name;
      restaurant.description = description || restaurant.description;
      restaurant.location = location || restaurant.location;

      // Update menu items (dynamically parse req.body keys)
      Object.keys(req.body).forEach((key) => {
          const match = key.match(/^menuItems\[(\d+)\]\.(.+)$/); // Match pattern menuItems[0].fieldName
          if (match) {
              const index = match[1]; // Extract index (e.g., 0, 1, 2)
              const field = match[2]; // Extract field name (e.g., category, price)

              if (restaurant.menuItems[index]) {
                  // Update specific field for the menu item at the given index
                  restaurant.menuItems[index][field] = req.body[key];
              }
          }
      });

      // Save the updated restaurant
      const updatedRestaurant = await restaurant.save();

      res.status(200).json({
          success: true,
          message: `Restaurant '${updatedRestaurant.name}' updated successfully!`,
          data: updatedRestaurant,
      });
  } catch (error) {
      res.status(500).json({
          success: false,
          message: 'Server Error: Could not update restaurant',
          error: error.message,
      });
  }
};

//Delete restaurant
export const deleteRestaurant = async (req, res) => {

    try {
        const restaurant = await Restaurant.findByIdAndDelete(req.params.id)
        res.status(201).json({success: true, message: "Restaurant '" + restaurant.name + "' deleted successfully!", restaurant})
    } catch (error) {
        res.status(404).json({success: false, message: 'Restaurant not found'})
    }
}

