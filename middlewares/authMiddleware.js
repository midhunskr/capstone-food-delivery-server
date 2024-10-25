import jwt from 'jsonwebtoken'

export const authUser = (req, res, next) => {
    try {
        // Fetch token from cookies
        const token = req.cookies.token;

        // Check if the token is missing
        if (!token) {
            return res.status(401).json({ success: false, message: 'Token missing, user not authenticated' });
        }

        // Verify and decrypt token
        const tokenVerified = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (!tokenVerified) {
            return res.status(400).json({ success: false, message: 'Invalid token, user not authenticated' });
        }

        // Assign the user data from the token to req.user (usually id is included in the token)
        req.user = tokenVerified
        
        // Proceed to the next middleware
        next();

    } catch (error) {
        // Handle token errors and other issues
        console.error("Token verification error:", error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token expired, please log in again' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: 'Invalid token, not authorized' });
        }
        
        // Catch-all for other errors
        res.status(500).json({ success: false, message: 'Authentication failed, not authorized' });
    }
};


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