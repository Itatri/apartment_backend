const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, default: 'user' },
    role: { type: String, enum: ['Admin', 'Owner', 'Tenant'], default: 'Tenant' }
});

module.exports = mongoose.model('User', userSchema);