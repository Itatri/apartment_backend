const mongoose = require('mongoose');

const TenentShcema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String},
        roomId: { type: mongoose.Schema.Types.ObjectId, ref : 'Room'},
        avatar: { type: String }, // URL to the tenant's avatar image
    }
    ,{ timestamps: true}
)

module.exports = mongoose.model('Tenant', TenentShcema);
// This code defines a Mongoose schema and model for tenants in an apartment management system.