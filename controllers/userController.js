import { User } from "../models/userModel.js"
import bcrypt from 'bcrypt'
import { generateUserToken } from "../utils/generateToken.js"

// Register User
export const registerUser = async (req, res) => {
    
    try {
        const { name, email, password, role, phone} = req.body

        //error handling for missing field
        if (!email || !password ) {
            return res.status(400).json({success: false, message: "All fields are required"})
        }

        //error handling for user exist
        let userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        //hashing password
        const salt = 10
        const hashedPassword = bcrypt.hashSync(password, salt)

        //save new user to database
        const newUser = new User({name, email, password: hashedPassword, role, phone})
        await newUser.save()    

        //tokenize user data
        const token = generateUserToken(email)

        //assign token to cookie
        res.cookie('token', token, {httpOnly: true})
        res.json({success: true, message: newUser.name + " resgistered as " + "'" + newUser.role + "'" + " successfully!"})

    } catch (error) {
        res.status(error.status || 500).json({message: error.messaage || 'Internal server error'})
    }
}

// Login User
export const loginUser = async (req, res) => {
    
    try {
        const { email, password} = req.body
             
        //Error handling for missing field
        if (!email || !password) {
            return res.status(400).json({success: false, message: "All fields are required"})
        }

        //Error handling for user not exist
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User does not exists' })
        }

        //Compare password
        const passwordMatch = bcrypt.compareSync(password, user.password)
        if(!passwordMatch) {
            return res.status(401).json({success: false, messaage: "Password does not match."})
        }

        //Tokenize user data
        const token = generateUserToken(user.id, user.role)

        //Assign token to cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            path: '/',
            maxAge: 24 * 60 * 60 * 1000,
          })

        //Success response
        res.json({
            success: true,
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            message: "'" + user.name + "'" + " logged in as " + "'" + user.role + "'" + " successfully!",
        })

    } catch (error) {
        return res.status(error.status || 500).json({message: error.messaage || 'Internal server error'})
    }
}

//User Profile
export const userProfile = async (req, res) => {
    
    try {
        //Destructure 'id' from logged-in user
        const user = req.user
        
        //Find user by Id and store the data in userData variable (exclude user password)
        // const userData = await User.findById(user.id).select("-password -phone")
        const userData = await User.findOne({ _id: user.id }, 'id email name')

        //Sucess response
        res.json(userData)

    } catch (error) {
        res.status(error.status || 500).json({message: error.messaage || 'Internal server error'})
    }
}

//Update user
export const updateUser = async (req, res) => {
    try {
      const userId = req.user.id; // Assuming req.user contains authenticated user data
      console.log(userId);
      
  
      // Extract name and email from the request body
      const { name, email } = req.body;
  
      // Validate the input data (add more validations if necessary)
    //   if (!name || !email) {
    //     return res.status(400).json({ error: "Name and email are required" });
    //   }
  
      // Check if the email is already in use by another user
      const existingUser = await User.findOne({email});
      if (existingUser) {
        return res.status(400).json({ error: "Email is already in use by another account" });
      }
  
      // Update the user in the database
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { name, email },
        { new: true, runValidators: true } // Return the updated user object and run validations
      );
  
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // Respond with the updated user data
      res.status(200).json({
        success: true,
        message: "User updated successfully",
        user: {
          name: updatedUser.name,
          email: updatedUser.email,
        },
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

//Get all users
export const getAllUsers = async (req, res) => {
    try {
        // Fetch all users from the database
        const users = await User.find().select('-password'); // Exclude the password field
        
        
        // Send the users in the response
        res.status(200).json({
            success: true,
            messaage: "Listed all users sucessfully!",
            count: users.length,
            users
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message })
    }
}

// Delete a user by ID function
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        await user.deleteOne();
        res.status(200).json({ success: true, message: "'" + user.name + "'" + ' successfully removed from ' + user.role + "'s list!" })
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message })
    }
};

//Check user
export const checkUser = async (req, res, next) => {
    
    try {
        //Fetch verified user from 'authMiddleware/authUser'
        const user = req.user
        // const userName = userData.name
        
        //Error handling
        if(!user) {
            return res.status(400).json({success: false, messaage:'authUser failed, user not authenticated'})
        }

        //Sucess response
        res.json({success: true, role: user.role, message: "User verified successfully!"})

    } catch (error) {
        res.status(error.status || 500).json({message: error.messaage || 'Internal server error'})
    }
}

// Logout User
export const logoutUser = async (req, res) => {
    try {
        // Clear the authentication token from cookies
        res.clearCookie('token', {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            path: '/',
            maxAge: 24 * 60 * 60 * 1000,
        });
        
        // Success response
        res.status(200).json({ success: true, message: "User logged out successfully!" });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

//Add address
export const addAddress = async (req, res) => {
    try {
        const { street, city, zip, state, country, isDefault } = req.body;
        console.log('Request body:', req.body); // Log the request body

        // Find the user by ID
        const userId = req.user.id; // Ensure you have the user's ID from the request
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create a new address
        const newAddress = {
            street,
            city,
            zip,
            state,
            country,
            isDefault: isDefault || false,
        };

        // Push the new address into the user's addresses array
        user.addresses.push(newAddress);

        // Save the user with the new address
        const updatedUser = await user.save();

        // Return the updated user or the new address
        res.status(201).json(updatedUser); // You can also return only the new address if needed
    } catch (error) {
        console.error('Error saving address:', error); // Log the error for debugging
        res.status(500).json({ message: 'Error saving address', error: error.message });
    }
};


//Get all address
export const getUserAddresses = async (req, res) => {
    try {
        const userId = req.user.id; // Ensure the user ID is correctly fetched
        const user = await User.findById(userId).select('addresses'); // Only select addresses

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user.addresses); // Return only the addresses
    } catch (error) {
        res.status(500).json({ message: 'Error fetching addresses', error });
    }
};

//Update address
export const updateAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Find the user and the address to update
        const user = await User.findOne({ _id: userId, 'addresses._id': id });

        if (!user) {
            return res.status(404).json({ message: 'User or address not found' });
        }

        // Find the address index
        const addressIndex = user.addresses.findIndex(address => address._id.toString() === id);

        // Update the address
        user.addresses[addressIndex] = { ...user.addresses[addressIndex]._doc, ...req.body };
        
        // Save the user with updated addresses
        const updatedUser = await user.save();
        res.status(200).json(updatedUser.addresses[addressIndex]); // Return the updated address
    } catch (error) {
        res.status(500).json({ message: 'Error updating address', error });
    }
};

//Delete address
export const deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Find the user
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Filter out the address to delete
        user.addresses = user.addresses.filter(address => address._id.toString() !== id);
        
        // Save the user with updated addresses
        await user.save();
        res.status(200).json({ message: 'Address deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting address', error });
    }
};