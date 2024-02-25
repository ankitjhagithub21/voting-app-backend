const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    try {
        // Check if the JWT token is present in the cookies
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "JWT token not found in the cookies."
            });
        }

        // Verify the token
        const userData = jwt.verify(token, process.env.JWT_SECRET);
        if (!userData) {
            return res.status(401).json({
                success: false,
                message: "JWT token is invalid or expired."
            });
        }

        // Attach user data to the request object
        req.user = userData;
        
        // Call next middleware
        next();

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = verifyToken;
