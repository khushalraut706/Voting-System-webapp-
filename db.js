const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection URL, taken from .env
const mongoURL = process.env.MONGODB_URL;

if (!mongoURL) {
    console.error('MONGODB_URL is not set. Copy .env.example to .env and fill it in.');
    process.exit(1);
}

mongoose.connect(mongoURL).catch((err) => {
    console.error('Initial MongoDB connection failed:', err.message);
    process.exit(1);
});

// Default connection object
const db = mongoose.connection;

db.on('connected', () => {
    console.log('Connected to MongoDB server');
});

db.on('error', (err) => {
    console.error('MongoDB connection error : ', err);
});

db.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

module.exports = db;
