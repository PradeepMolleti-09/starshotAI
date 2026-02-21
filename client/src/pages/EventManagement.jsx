import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload, Trash2, ArrowLeft, Image as ImageIcon, CheckCircle2,
    AlertCircle, X, Loader2, Maximize2, Trash, Users
} from 'lucide-react';
import axios from '../api/axios';
import { format } from 'date-fns';

const EventManagement = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchEventDetails();
        fetchPhotos();
    }, [eventId]);

    // Prevent accidental refresh during upload
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (uploading) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [uploading]);

    const fetchEventDetails = async () => {
        try {
            const { data } = await axios.get(`/api/events/${eventId}`);
            setEvent(data);
        } catch (error) {
            console.error("Failed to fetch event:", error);
            navigate('/dashboard');
        }
    };

    const fetchPhotos = async () => {
        try {
            const { data } = await axios.get(`/api/photos/event/${eventId}`);
            setPhotos(data);
        } catch (error) {
            console.error("Failed to fetch photos:", error);
        } finally {
            setLoading(false);
        }
    };

    const resizeImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1920;
                    const MAX_HEIGHT = 1080;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        const resizedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(resizedFile);
                    }, 'image/jpeg', 0.85); // 85% quality JPEG
                };
            };
        });
    };

    const handleFileUpload = async (files) => {
        if (!files.length) return;
        setUploading(true);
        setUploadProgress(0);
        setUploadStatus('Optimizing images...');

        try {
            const formData = new FormData();
            formData.append('eventId', eventId);

            // Limit concurrency of resizing to avoid crashing browser memory
            const optimizedFiles = [];
            for (let i = 0; i < files.length; i++) {
                setUploadStatus(`Optimizing image ${i + 1} of ${files.length}...`);
                const optimized = await resizeImage(files[i]);
                optimizedFiles.push(optimized);
            }

            setUploadStatus('Sending to server...');
            optimizedFiles.forEach((file) => {
                formData.append('photos', file);
            });

            await axios.post('/api/photos/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                    if (percentCompleted === 100) {
                        setUploadStatus('AI: Detecting faces & matching...');
                    } else {
                        setUploadStatus(`Uploading... ${percentCompleted}%`);
                    }
                }
            });

            setUploadStatus('Success!');
            fetchPhotos();
            fetchEventDetails();
        } catch (error) {
            alert("Upload failed: " + (error.response?.data?.message || error.message));
        } finally {
            setUploading(false);
            setUploadProgress(0);
            setUploadStatus('');
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDeletePhoto = async (photoId) => {
        if (!window.confirm("Are you sure you want to delete this photo?")) return;
        try {
            await axios.delete(`/api/photos/${photoId}`);
            setPhotos(photos.filter(p => p._id !== photoId));
            fetchEventDetails(); // Update photo count
        } catch (error) {
            console.error("Failed to delete photo:", error);
        }
    };

    if (loading || !event) return (
        <div className="pt-32 text-center">
            <Loader2 className="w-12 h-12 text-apple-blue animate-spin mx-auto" />
        </div>
    );

    const isExpired = new Date(event.expiryDate) < new Date() || event.isExpired;

    return (
        <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
            <div className="mb-10 flex items-center justify-between">
                <Link to="/dashboard" className="flex items-center text-apple-darkGray hover:text-apple-black transition-colors group">
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Back to Events</span>
                </Link>
                <div className="flex items-center space-x-2 text-sm font-semibold">
                    <span className="text-apple-darkGray">Photos expire on:</span>
                    <span className={`px-3 py-1 rounded-full ${isExpired ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-apple-blue'}`}>
                        {format(new Date(event.expiryDate), 'MMMM dd, yyyy')}
                    </span>
                </div>
            </div>

            <div className="mb-12">
                <h1 className="text-4xl font-bold text-apple-black mb-2">{event.name}</h1>
                <p className="text-apple-darkGray">Manage your event gallery and uploads.</p>
            </div>

            {/* Upload Zone */}
            {!isExpired ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-apple-blue', 'bg-blue-50'); }}
                    onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-apple-blue', 'bg-blue-50'); }}
                    onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('border-apple-blue', 'bg-blue-50');
                        handleFileUpload(e.dataTransfer.files);
                    }}
                    className={`apple-card border-dashed border-2 py-16 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-gray-50 mb-16 ${uploading ? 'pointer-events-none opacity-50' : ''}`}
                >
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={(e) => handleFileUpload(e.target.files)}
                    />
                    {uploading ? (
                        <div className="flex flex-col items-center">
                            <Loader2 className="w-12 h-12 text-apple-blue animate-spin mb-4" />
                            <p className="text-apple-black font-semibold">{uploadStatus}</p>
                            <div className="w-64 h-2 bg-gray-100 rounded-full mt-4 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${uploadProgress}%` }}
                                    className="h-full bg-apple-blue"
                                />
                            </div>
                            <p className="text-apple-darkGray text-xs mt-3 uppercase tracking-widest font-bold">Do not refresh or close this tab</p>
                        </div>
                    ) : (
                        <>
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                                <Upload className="w-8 h-8 text-apple-blue" />
                            </div>
                            <p className="text-xl font-bold text-apple-black mb-2">Click or drag photos here</p>
                            <p className="text-apple-darkGray">Up to 20 photos at a time. Supports high-res JPG & PNG.</p>
                        </>
                    )}
                </div>
            ) : (
                <div className="apple-card bg-red-50 border-red-100 p-8 flex items-center space-x-4 mb-16">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                    <div>
                        <p className="text-red-700 font-bold">This event has expired</p>
                        <p className="text-red-600">Uploading new photos is disabled. All existing photos will be cleaned up shortly if not already.</p>
                    </div>
                </div>
            )}

            {/* Photo Grid */}
            <h2 className="text-2xl font-bold text-apple-black mb-8">Photos ({photos.length})</h2>
            {photos.length === 0 ? (
                <div className="text-center py-20 bg-apple-gray rounded-3xl border border-gray-100">
                    <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-apple-darkGray font-medium">No photos uploaded to this event yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    <AnimatePresence>
                        {photos.map((photo) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                key={photo._id}
                                className="group relative aspect-square rounded-2xl overflow-hidden bg-apple-gray shadow-sm hover:shadow-md transition-all"
                            >
                                <img src={photo.url} alt="Event" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                                    <button
                                        onClick={() => handleDeletePhoto(photo._id)}
                                        className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition-colors"
                                        title="Delete Photo"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                    <a
                                        href={photo.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-apple-blue transition-colors"
                                    >
                                        <Maximize2 className="w-5 h-5" />
                                    </a>
                                </div>
                                {photo.faceDescriptors?.length > 0 && (
                                    <div className="absolute top-3 left-3 px-2 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] text-white font-bold flex items-center gap-1">
                                        <Users className="w-3 h-3" />
                                        {photo.faceDescriptors.length} {photo.faceDescriptors.length === 1 ? 'Face' : 'Faces'}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default EventManagement;
