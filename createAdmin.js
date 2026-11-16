// Creates the single admin account (admins cannot be created through /user/signup).
// Usage: set the ADMIN_* values in .env, then run:  npm run create-admin
require('dotenv').config();
const db = require('../db');
const User = require('../models/user');

const run = async () => {
    try {
        const existing = await User.findOne({ role: 'admin' });
        if (existing) {
            console.log('An admin already exists (Aadhar: ' + existing.aadharCardNumber + '). Nothing to do.');
            return;
        }

        const admin = new User({
            name: process.env.ADMIN_NAME || 'Election Admin',
            age: Number(process.env.ADMIN_AGE) || 40,
            address: process.env.ADMIN_ADDRESS || 'Election Commission Office',
            aadharCardNumber: Number(process.env.ADMIN_AADHAR),
            password: process.env.ADMIN_PASSWORD,
            role: 'admin',
        });
        await admin.save();
        console.log('Admin created. Login with Aadhar number ' + admin.aadharCardNumber + ' and the ADMIN_PASSWORD from .env');
    } catch (err) {
        console.error('Could not create admin:', err.message);
        process.exitCode = 1;
    } finally {
        await db.close();
    }
};

if (db.readyState === 1) run();
else db.once('connected', run);
