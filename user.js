const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the user schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    age: {
        type: Number,
        required: true,
        min: 1,
    },
    email: {
        type: String,
        trim: true,
    },
    mobile: {
        type: String,
        trim: true,
    },
    address: {
        type: String,
        required: true,
        trim: true,
    },
    aadharCardNumber: {
        type: Number,
        required: true,
        unique: true,
        validate: {
            validator: (v) => /^\d{12}$/.test(String(v)),
            message: 'aadharCardNumber must be exactly 12 digits',
        },
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['voter', 'admin'],
        default: 'voter',
    },
    isVoted: {
        type: Boolean,
        default: false,
    },
});

userSchema.pre('save', async function (next) {
    const user = this;

    // Hash the password only if it has been modified (or is new)
    if (!user.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        next();
    } catch (err) {
        return next(err);
    }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    // Compare the provided password with the stored hash
    return bcrypt.compare(candidatePassword, this.password);
};

// Never leak the password hash in JSON responses
userSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.password;
        return ret;
    },
});

module.exports = mongoose.model('User', userSchema);
