const mongoose = require('mongoose');

const PhotoSchema = new mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    faceDescriptors: { type: Array, default: [] },
    processingStatus: { type: String, enum: ['processing', 'ready', 'failed'], default: 'processing' },
}, { timestamps: true });

module.exports = mongoose.model('Photo', PhotoSchema);
