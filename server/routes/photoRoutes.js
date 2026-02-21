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
const mongoose = require('mongoose');

// --- Singleton Background Queue to prevent memory crashes on Render (512MB RAM) ---
const aiQueue = [];
let isProcessingQueue = false;

const processNextInQueue = async () => {
    if (isProcessingQueue || aiQueue.length === 0) return;

    isProcessingQueue = true;
    const task = aiQueue.shift();

    try {
        console.log(`[AI Queue] Processing Photo: ${task.photoId} | Queue Depth: ${aiQueue.length}`);
        const descriptors = await getDescriptors(task.buffer);

        await Photo.findByIdAndUpdate(task.photoId, {
            faceDescriptors: descriptors,
            processingStatus: 'ready'
        });
        console.log(`[AI Queue] Success: ${task.photoId}`);
    } catch (err) {
        console.error(`[AI Queue] Fatal for ${task.photoId}:`, err.message);
        try {
            await Photo.findByIdAndUpdate(task.photoId, { processingStatus: 'failed' });
        } catch (dbErr) {
            console.error(`[AI Queue] DB Status Update failed:`, dbErr.message);
        }
    } finally {
        isProcessingQueue = false;
        // Small delay to allow Garbage Collection to breathe
        setTimeout(processNextInQueue, 300);
    }
};

// Upload Photos
router.post('/upload', upload.array('photos'), async (req, res) => {
    const requestStart = Date.now();
    console.log(`\n>>> INCOMING UPLOAD: ${new Date().toISOString()}`);

    try {
        const { eventId } = req.body;
        const files = req.files;

        // 1. Precise Validation
        if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
            console.error(`Invalid Event ID: ${eventId}`);
            return res.status(400).json({ message: 'Missing or Invalid Event ID' });
        }

        if (!files || files.length === 0) {
            console.error('No files received in multipart request');
            return res.status(400).json({ message: 'No photos received' });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            console.error(`Event ${eventId} not found`);
            return res.status(404).json({ message: 'Event not found' });
        }

        console.log(`Event Context: ${event.name} | Files: ${files.length}`);

        // 2. Sequential Cloudinary Uploads (Safety First)
        const results = [];
        for (const file of files) {
            try {
                console.log(`Streaming to Cloudinary: ${file.originalname}`);

                const uploadResult = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream({
                        folder: `starshot/${eventId}`,
                        resource_type: 'image'
                    }, (error, result) => {
                        if (error) {
                            console.error('Cloudinary Error:', error);
                            reject(new Error(error.message));
                        } else resolve(result);
                    });
                    stream.end(file.buffer);
                });

                // Immediate DB shadow entry
                const photo = new Photo({
                    eventId,
                    url: uploadResult.secure_url,
                    publicId: uploadResult.public_id,
                    processingStatus: 'processing'
                });
                await photo.save();
                results.push(photo);

                // Push to Background Queue (RAM safe)
                aiQueue.push({ photoId: photo._id, buffer: file.buffer });
                processNextInQueue();

            } catch (fileError) {
                console.error(`Sub-task failed for ${file.originalname}:`, fileError.message);
            }
        }

        if (results.length === 0) {
            throw new Error('Could not save any photos. Check Cloudinary/DB status.');
        }

        console.log(`<<< RESPONSE SENT in ${Date.now() - requestStart}ms`);
        res.status(201).json({
            success: true,
            results,
            message: 'Photos uploaded. AI processing is queued in background.'
        });

    } catch (error) {
        console.error('CRITICAL UPLOAD ROUTE CRASH:', error);
        res.status(500).json({
            message: 'Internal processing error',
            details: error.message
        });
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
