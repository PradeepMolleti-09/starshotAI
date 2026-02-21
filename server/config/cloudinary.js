const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

const cleanStr = (str) => (str || '').trim().replace(/['"]/g, '');

console.log(`Cloudinary System Time Check: ${new Date().toISOString()}`);

cloudinary.config({
    cloud_name: cleanStr(process.env.CLOUDINARY_CLOUD_NAME),
    api_key: cleanStr(process.env.CLOUDINARY_API_KEY),
    api_secret: cleanStr(process.env.CLOUDINARY_API_SECRET),
});

module.exports = cloudinary;
