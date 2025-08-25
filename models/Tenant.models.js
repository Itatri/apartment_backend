const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female'], default: 'Male' },
  phone: { type: String, required: true },
  idCard: { type: String, required: true },
  address: { type: String },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  avatar: { type: String } // link ảnh upload
}, { timestamps: true });

module.exports = mongoose.model('Tenant', tenantSchema);
