const cron = require('node-cron');
const Event = require('../models/Event');
const Photo = require('../models/Photo');
const cloudinary = require('../config/cloudinary');

const startCleanupJob = () => {
    // Run every day at midnight
    cron.schedule('0 0 * * *', async () => {
        console.log('Running expiry cleanup job...');
        try {
            const now = new Date();
            // Find events that have expired but not marked yet
            const expiredEvents = await Event.find({
                expiryDate: { $lte: now },
                isExpired: false
            });

            for (const event of expiredEvents) {
                console.log(`Cleaning up expired event: ${event._id}`);

                // 1. Get all photos for this event
                const photos = await Photo.find({ eventId: event._id });

                // 2. Delete from Cloudinary
                for (const photo of photos) {
                    try {
                        await cloudinary.uploader.destroy(photo.publicId);
                    } catch (err) {
                        console.error(`Failed to delete cloudinary image ${photo.publicId}:`, err.message);
                    }
                }

                // 3. Delete photos from DB
                await Photo.deleteMany({ eventId: event._id });

                // 4. Mark event as expired
                event.isExpired = true;
                await event.save();

                console.log(`Event ${event._id} cleanup complete.`);
            }
        } catch (error) {
            console.error('Error in cleanup job:', error);
        }
    });
};

module.exports = startCleanupJob;
