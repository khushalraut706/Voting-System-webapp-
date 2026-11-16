const express = require('express');
const path = require('path');
require('dotenv').config();
require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // req.body (replaces body-parser; same behaviour)

// Optional frontend (static files in /public)
app.use(express.static(path.join(__dirname, 'public')));

// Original welcome message, kept as an API route
app.get('/api', (req, res) => {
    res.send('Welcome to my Voting Application......');
});

// Routers
const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');

app.use('/user', userRoutes);
app.use('/candidate', candidateRoutes);

// Malformed JSON bodies and other errors
app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'Invalid JSON body' });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
