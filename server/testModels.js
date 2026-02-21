const faceapi = require('face-api.js');
const canvas = require('canvas');
const path = require('path');

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const modelPath = path.join(__dirname, 'models');

async function test() {
    console.log('Testing full model loading...');
    try {
        await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
        console.log('Success: ssdMobilenetv1 loaded');
        await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
        console.log('Success: faceLandmark68Net loaded');
        await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
        console.log('Success: faceRecognitionNet loaded');
    } catch (err) {
        console.error('Failed to load models:', err);
    }
}

test();
