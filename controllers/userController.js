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
        res.cookie('token', token, {httpOnly: true})

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
        res.json({success: true, message: "User verified successfully!"})

    } catch (error) {
        res.status(error.status || 500).json({message: error.messaage || 'Internal server error'})
    }
}

// Logout User
export const logoutUser = async (req, res) => {
    try {
        // Clear the authentication token from cookies
        res.clearCookie('token');
        
        // Success response
        res.status(200).json({ success: true, message: "User logged out successfully!" });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};