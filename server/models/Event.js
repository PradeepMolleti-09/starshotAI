const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, default: Date.now },
  photographerId: { type: String, required: true }, // Firebase UID
  expiryDate: { type: Date, required: true },
  isExpired: { type: Boolean, default: false },
  expiryDays: { type: Number, required: true }, // 30, 60, or 90
  qrCodeUrl: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);
