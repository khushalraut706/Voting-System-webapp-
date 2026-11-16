const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const { jwtAuthMiddleware } = require('./../jwt');
const Candidate = require('./../models/candidate');

const checkAdminRole = async (userId) => {
    try {
        const user = await User.findById(userId);
        return !!user && user.role === 'admin';
    } catch (err) {
        return false;
    }
};

// Only these fields may be set by the admin
const pickCandidateFields = (body) => {
    const out = {};
    ['name', 'party', 'age'].forEach((k) => {
        if (body[k] !== undefined) out[k] = body[k];
    });
    return out;
};

// POST /candidate - add a candidate (admin only)
router.post('/', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id))) {
            return res.status(403).json({ message: 'User has not admin role' });
        }

        const newCandidate = new Candidate(pickCandidateFields(req.body));
        const response = await newCandidate.save();
        console.log('data saved successfully...');

        res.status(200).json({ response: response });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: Object.values(err.errors).map((e) => e.message).join(', ') });
        }
        console.log('Error saving candidate:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /candidate/:candidateId - update a candidate (admin only)
router.put('/:candidateId', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id))) {
            return res.status(403).json({ message: 'User has not admin role' });
        }

        const candidateId = req.params.candidateId;
        const updateData = pickCandidateFields(req.body);

        const response = await Candidate.findByIdAndUpdate(candidateId, updateData, {
            new: true,
            runValidators: true,
        });

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('candidate data updated');
        res.status(200).json(response);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid candidate id' });
        }
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: Object.values(err.errors).map((e) => e.message).join(', ') });
        }
        console.log('Error updating candidate:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /candidate/:candidateId - delete a candidate (admin only)
router.delete('/:candidateId', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id))) {
            return res.status(403).json({ message: 'User has not admin role' });
        }

        const response = await Candidate.findByIdAndDelete(req.params.candidateId);
        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('candidate data deleted');
        res.status(200).json({ message: 'Candidate deleted successfully' });
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid candidate id' });
        }
        console.log('Error deleting candidate:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /candidate/vote/:candidateId - vote for a candidate
// Rules: admin cannot vote, a user can vote only once
router.post('/vote/:candidateId', jwtAuthMiddleware, async (req, res) => {
    const candidateId = req.params.candidateId;
    const userId = req.user.id;

    try {
        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ message: 'admin is not allowed to vote' });
        }

        // Atomically claim the vote so two simultaneous requests cannot both succeed
        const claimed = await User.findOneAndUpdate(
            { _id: userId, isVoted: false },
            { isVoted: true }
        );
        if (!claimed) {
            return res.status(400).json({ message: 'You have already voted' });
        }

        try {
            await Candidate.findByIdAndUpdate(candidateId, {
                $push: { votes: { user: userId } },
                $inc: { voteCount: 1 },
            });
        } catch (err) {
            // Roll back the claim if recording the vote failed
            await User.findByIdAndUpdate(userId, { isVoted: false });
            throw err;
        }

        res.status(200).json({ message: 'Vote recorded successfully' });
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid candidate id' });
        }
        console.log('Error detected', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /candidate/vote/count - candidates sorted by vote count (descending)
router.get('/vote/count', async (req, res) => {
    try {
        const candidates = await Candidate.find().sort({ voteCount: 'desc' });

        const voteRecord = candidates.map((data) => {
            return {
                name: data.name,
                party: data.party,
                count: data.voteCount,
            };
        });
        return res.status(200).json(voteRecord);
    } catch (err) {
        console.log('Error detected', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /candidate - list of candidates (voter identities are not exposed)
router.get('/', async (req, res) => {
    try {
        const data = await Candidate.find().select('-votes');
        res.status(200).json(data);
    } catch (err) {
        console.log('Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
