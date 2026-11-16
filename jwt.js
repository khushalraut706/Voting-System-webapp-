const jwt = require('jsonwebtoken');

const jwtAuthMiddleware = (req, res, next) => {
    // First check that the request has an Authorization header
    const authorization = req.headers.authorization;
    if (!authorization) return res.status(401).json({ error: 'Token not found' });

    // Extract the JWT from "Bearer <token>"
    const token = authorization.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        // Verify the token (expiry is enforced from the token itself)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user information to the request object
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// Generate a JWT from user data
const generateToken = (userData) => {
    return jwt.sign(userData, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });
};

module.exports = { jwtAuthMiddleware, generateToken };
