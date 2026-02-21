const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const Photo = require('../models/Photo');
const Event = require('../models/Event');
const { getDescriptors } = require('../utils/faceApi');
const faceapi = require('face-api.js');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload Photos
router.post('/upload', upload.array('photos'), async (req, res) => {
    const { eventId } = req.body;
    const files = req.files;

    console.log(`Starting upload for event: ${eventId}, files count: ${files?.length}`);

    try {
        const event = await Event.findById(eventId);
        if (!event || event.isExpired) {
            console.log('Event not found or expired');
            return res.status(400).json({ message: 'Event is expired or not found' });
        }

        // Helper for background AI processing
        const processAIInBackground = async (photoId, buffer) => {
            try {
                console.log(`[Background AI] Starting for ${photoId}`);
                const descriptors = await getDescriptors(buffer);
                await Photo.findByIdAndUpdate(photoId, {
                    faceDescriptors: descriptors,
                    processingStatus: 'ready'
                });
                console.log(`[Background AI] Success for ${photoId} | Found ${descriptors.length} faces`);
            } catch (err) {
                console.error(`[Background AI] Failed for ${photoId}:`, err.message);
                await Photo.findByIdAndUpdate(photoId, { processingStatus: 'failed' });
            }
        };

        const results = [];
        for (const file of files) {
            try {
                console.log(`Cloudinary Upload starting: ${file.originalname}`);

                // 1. Upload to Cloudinary (Fast)
                const uploadResult = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream({ folder: `starshot/${eventId}` }, (error, result) => {
                        if (error) reject(new Error(error.message || 'Cloudinary rejected the file'));
                        else resolve(result);
                    });
                    stream.end(file.buffer);
                });

                // 2. Immediate DB save with 'processing' status
                const photo = new Photo({
                    eventId,
                    url: uploadResult.secure_url,
                    publicId: uploadResult.public_id,
                    processingStatus: 'processing'
                });
                await photo.save();
                results.push(photo);

                // 3. Start AI work in background (DO NOT await)
                processAIInBackground(photo._id, file.buffer);

                console.log(`Initial save complete for: ${file.originalname}`);
            } catch (fileError) {
                console.error(`Upload error for ${file.originalname}:`, fileError.message);
            }
        }

        res.status(201).json({
            success: true,
            results,
            message: 'Upload successful. AI is processing in the background.'
        });
    } catch (error) {
        console.error('Final upload error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Match Selfie
router.post('/match', upload.single('selfie'), async (req, res) => {
    const { eventId } = req.body;
    const file = req.file;

    try {
        const event = await Event.findById(eventId);
        if (!event || event.isExpired) {
            return res.status(400).json({ message: 'Event is expired or not found' });
        }

        // 1. Get Selfie Descriptor
        const selfieDescriptors = await getDescriptors(file.buffer);
        if (selfieDescriptors.length === 0) {
            return res.status(400).json({ message: 'No face detected in selfie' });
        }
        const targetDescriptor = selfieDescriptors[0];

        // 2. Fetch all photos for the event
        const photos = await Photo.find({ eventId });

        // 3. Compare descriptors
        const matches = photos.filter(photo => {
            return photo.faceDescriptors.some(desc => {
                const dist = faceapi.euclideanDistance(targetDescriptor, desc);
                return dist < 0.5; // Threshold as requested
            });
        });

        res.json(matches);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// Delete Photo
router.delete('/:id', async (req, res) => {
    try {
        const photo = await Photo.findById(req.params.id);
        if (!photo) return res.status(404).json({ message: 'Photo not found' });

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(photo.publicId);

        // Delete from DB
        await Photo.findByIdAndDelete(req.params.id);

        res.json({ message: 'Photo deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all photos for event (for photographer)
router.get('/event/:eventId', async (req, res) => {
    try {
        const photos = await Photo.find({ eventId: req.params.eventId }).sort({ createdAt: -1 });
        res.json(photos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
