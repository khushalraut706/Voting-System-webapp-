const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const { jwtAuthMiddleware, generateToken } = require('./../jwt');

const isAdmin = async (userId) => {
    try {
        const user = await User.findById(userId);
        return !!user && user.role === 'admin';
    } catch (err) {
        return false;
    }
};

// POST /user/signup - create a new user account
router.post('/signup', async (req, res) => {
    try {
        const { name, age, email, mobile, address, aadharCardNumber, password, role } = req.body;

        // Admin accounts cannot be created through signup
        if (role === 'admin') {
            return res.status(403).json({ message: 'admin is already present' });
        }

        if (!password || String(password).length < 4) {
            return res.status(400).json({ error: 'Password must be at least 4 characters' });
        }

        // Only whitelisted fields are accepted (role/isVoted cannot be injected)
        const newUser = new User({ name, age, email, mobile, address, aadharCardNumber, password });

        const response = await newUser.save();
        console.log('data saved successfully...');

        const payload = { id: response.id };
        const token = generateToken(payload);

        res.status(200).json({ response: response, token: token });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: Object.values(err.errors).map((e) => e.message).join(', ') });
        }
        if (err.code === 11000) {
            return res.status(400).json({ error: 'User with this Aadhar card number already exists' });
        }
        console.log('Error saving user:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /user/login - login with aadharCardNumber + password
router.post('/login', async (req, res) => {
    try {
        const { aadharCardNumber, password } = req.body;

        if (!aadharCardNumber || !password) {
            return res.status(400).json({ error: 'aadharCardNumber and password are required' });
        }

        const user = await User.findOne({ aadharCardNumber: aadharCardNumber });

        // If user does not exist or password does not match, return error
        if (!user || !(await user.comparePassword(String(password)))) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const payload = { id: user.id };
        const token = generateToken(payload);

        res.json({ token });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /user/profile - logged-in user's profile
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.status(200).json({ user });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /user - list of all users (admin only; password hashes are never returned)
router.get('/', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await isAdmin(req.user.id))) {
            return res.status(403).json({ message: 'User has not admin role' });
        }
        const data = await User.find();
        res.status(200).json(data);
    } catch (err) {
        console.log('Error fetching users:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /user/profile/password - change the logged-in user's password
router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'currentPassword and newPassword are required' });
        }
        if (String(newPassword).length < 4) {
            return res.status(400).json({ error: 'New password must be at least 4 characters' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // If the current password does not match, return error
        if (!(await user.comparePassword(String(currentPassword)))) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Update the user's password (hashed by the pre-save hook)
        user.password = String(newPassword);
        await user.save();

        console.log('Password updated');
        res.status(200).json({ message: 'Password Updated' });
    } catch (err) {
        console.log('Error updating password:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
