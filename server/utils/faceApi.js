const faceapi = require('face-api.js');
const canvas = require('canvas');
const path = require('path');

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

let modelsLoaded = false;

const loadModels = async () => {
    if (modelsLoaded) return;
    const modelPath = path.join(__dirname, '../models');
    console.log(`Loading face-api models from: ${modelPath}`);
    try {
        await faceapi.nets.tinyFaceDetector.loadFromDisk(modelPath);
        console.log('tinyFaceDetector loaded');
        await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
        console.log('faceLandmark68Net loaded');
        await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
        console.log('faceRecognitionNet loaded');
        modelsLoaded = true;
        console.log('All face-api models loaded successfully');
    } catch (error) {
        console.error('CRITICAL: Error loading face-api models:', error);
        throw error;
    }
};

const getDescriptors = async (imageBuffer) => {
    try {
        await loadModels();
        console.log('Converting buffer to canvas image...');
        const img = await canvas.loadImage(imageBuffer);
        console.log('Image loaded into canvas, detecting faces...');

        const detections = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 256, scoreThreshold: 0.5 }))
            .withFaceLandmarks()
            .withFaceDescriptors();

        console.log(`Detection finished. Found ${detections.length} faces.`);
        return detections.map(d => Array.from(d.descriptor));
    } catch (error) {
        console.error('Error in getDescriptors:', error);
        throw error;
    }
};

module.exports = { getDescriptors };
