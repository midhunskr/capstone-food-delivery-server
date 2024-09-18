import jwt from 'jsonwebtoken'

export const authUser = (req, res, next) => {
    try {
        
        //Fetch token
        const {token} = req.cookies
        
        if(!token){return res.status(400).json({success: false, message: 'Token missing, user not authenticated'})}

        //Compare and Decrypt token
        const tokenVerified = jwt.verify(token, process.env.JWT_SECRET_KEY)
        if(!tokenVerified){return res.status(400).json({success: false, message: 'Invalid token, user not authenticated'})}

        //Assign verified token to req.user for 'checkUser'
        req.user = tokenVerified
        
        //Proceed to next middleware
        next()

    } catch (error) {
        res.status(401).json({success: false, message: 'Token failed, not authorized'})
        
    }

}

//Admin access
export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {   
        next()
    } else {
        res.status(401).json({success: false, message: 'Not authorized as an admin'})
    }
}

//Delivery access
export const delivery = (req, res, next) => {
    if (req.user && req.user.role === 'delivery') {   
        next()
    } else {
        res.status(401).json({success: false, message: 'Not authorized as a delivery executive'})
    }
}