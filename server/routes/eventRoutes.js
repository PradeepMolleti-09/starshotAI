const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Photo = require('../models/Photo');

// Create Event
router.post('/', async (req, res) => {
    try {
        const { name, photographerId, expiryDays } = req.body;
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + parseInt(expiryDays));

        const event = new Event({
            name,
            photographerId,
            expiryDays,
            expiryDate,
        });

        await event.save();
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get photographer events
router.get('/photographer/:id', async (req, res) => {
    console.log(`Fetching events for photographer: ${req.params.id}`);
    try {
        const events = await Event.find({ photographerId: req.params.id }).sort({ createdAt: -1 });
        console.log(`Found ${events.length} events`);

        // Enrich with photo count
        const enrichedEvents = await Promise.all(events.map(async (event) => {
            try {
                const photoCount = await Photo.countDocuments({ eventId: event._id });
                return { ...event.toObject(), photoCount };
            } catch (countErr) {
                console.error(`Error counting photos for event ${event._id}:`, countErr);
                return { ...event.toObject(), photoCount: 0 };
            }
        }));

        res.json(enrichedEvents);
    } catch (error) {
        console.error('Error in /photographer/:id:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get single event
router.get('/:id', async (req, res) => {
    console.log(`Fetching details for event: ${req.params.id}`);
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            console.log('Event not found');
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(event);
    } catch (error) {
        console.error(`Error fetching event ${req.params.id}:`, error);
        res.status(500).json({ message: error.message });
    }
});

const cloudinary = require('../config/cloudinary');

// Delete Event
router.delete('/:id', async (req, res) => {
    try {
        const eventId = req.params.id;

        // 1. Find all photos for this event
        const photos = await Photo.find({ eventId });

        // 2. Delete from Cloudinary
        for (const photo of photos) {
            try {
                await cloudinary.uploader.destroy(photo.publicId);
            } catch (err) {
                console.error(`Failed to delete cloudinary image ${photo.publicId}:`, err.message);
            }
        }

        // 3. Delete photos from DB
        await Photo.deleteMany({ eventId });

        // 4. Delete Event from DB
        await Event.findByIdAndDelete(eventId);

        res.json({ message: 'Event and associated photos deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
