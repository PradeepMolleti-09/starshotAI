const mongoose = require('mongoose');

const PhotoSchema = new mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true }, // Cloudinary public ID for deletion
    faceDescriptors: { type: Array, required: true }, // Array of 128-float arrays
}, { timestamps: true });

module.exports = mongoose.model('Photo', PhotoSchema);
