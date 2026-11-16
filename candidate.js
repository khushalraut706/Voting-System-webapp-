const mongoose = require('mongoose');

// Define the candidate schema
const candidateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    party: {
        type: String,
        required: true,
        trim: true,
    },
    age: {
        type: Number,
        required: true,
        min: 1,
    },
    votes: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            votedAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    voteCount: {
        type: Number,
        default: 0,
    },
});

module.exports = mongoose.model('Candidate', candidateSchema);
