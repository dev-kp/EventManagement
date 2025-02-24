// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // console.log('Auth Middleware: Request received');
    // console.log('Headers:', req.headers);

    // Extract token from the Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    // console.log('Token extracted:', token);

    if (!token) {
        console.log('No token provided. Access denied.');
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        // console.log('Verifying token...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log('Token successfully decoded:', decoded);

        // Attach the decoded user information to the request object
        req.user = decoded;
        // console.log('User attached to request:', req.user);

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        console.error('Error verifying token:', error);

        // Log the specific error message and stack trace
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);

        // Check if the error is due to token expiration
        if (error.name === 'TokenExpiredError') {
            console.log('Token has expired.');
            return res.status(401).json({ message: 'Token has expired.' });
        }

        // Check if the error is due to an invalid token
        if (error.name === 'JsonWebTokenError') {
            console.log('Invalid token.');
            return res.status(400).json({ message: 'Invalid token.' });
        }

        // Handle any other unexpected errors
        console.log('Unexpected error during token verification.');
        res.status(500).json({ message: 'Internal server error during token verification.' });
    }
};

module.exports = authMiddleware;