import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera, Upload, Search, Download, CheckCircle2,
    AlertCircle, X, Loader2, Sparkles, Smile, Image as ImageIcon
} from 'lucide-react';
import axios from '../api/axios';
import confetti from 'canvas-confetti';

const FanPage = () => {
    const { eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [matching, setMatching] = useState(false);
    const [matches, setMatches] = useState([]);
    const [searched, setSearched] = useState(false);
    const [selfiePreview, setSelfiePreview] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchEventDetails();
    }, [eventId]);

    const fetchEventDetails = async () => {
        try {
            const { data } = await axios.get(`/api/events/${eventId}`);
            setEvent(data);
        } catch (error) {
            console.error("Failed to fetch event:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelfieUpload = async (file) => {
        if (!file) return;
        setSelfiePreview(URL.createObjectURL(file));
        setMatching(true);
        setSearched(false);
        setMatches([]);

        const formData = new FormData();
        formData.append('eventId', eventId);
        formData.append('selfie', file);

        try {
            const { data } = await axios.post('/api/photos/match', formData);
            setMatches(data);
            setSearched(true);
            if (data.length > 0) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#0066cc', '#86868b', '#ffffff']
                });
            }
        } catch (error) {
            alert("Matching failed: " + (error.response?.data?.message || "Make sure your face is clearly visible."));
            setSelfiePreview(null);
        } finally {
            setMatching(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <Loader2 className="w-12 h-12 text-apple-blue animate-spin" />
        </div>
    );

    if (!event) return (
        <div className="min-h-screen flex items-center justify-center bg-white px-6 text-center">
            <div className="max-w-md">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                <h1 className="text-3xl font-bold text-apple-black mb-4">Event Not Found</h1>
                <p className="text-apple-darkGray mb-8">The link you followed seems to be invalid or the event no longer exists.</p>
                <button onClick={() => window.location.href = '/'} className="apple-button-primary">Go to Home</button>
            </div>
        </div>
    );

    const isExpired = new Date(event.expiryDate) < new Date() || event.isExpired;

    return (
        <div className="min-h-screen bg-apple-gray pt-20 pb-20 px-6">
            <div className="max-w-xl mx-auto">
                <header className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100"
                    >
                        <Camera className="w-8 h-8 text-apple-blue" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-apple-black mb-2">{event.name}</h1>
                    <p className="text-apple-darkGray font-medium">Find your photos instantly</p>
                </header>

                {isExpired ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl p-10 text-center shadow-sm"
                    >
                        <Clock className="w-16 h-16 text-red-500 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-apple-black mb-4">Photos Expired</h2>
                        <p className="text-apple-darkGray leading-relaxed">
                            We're sorry, but the photos for this event are no longer available.
                            Photographers set an expiry date for privacy and storage reasons.
                        </p>
                    </motion.div>
                ) : (
                    <>
                        {!searched && !matching ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-3xl p-8 pt-10 text-center shadow-sm border border-gray-100"
                            >
                                <div className="w-24 h-24 bg-apple-gray rounded-full flex items-center justify-center mx-auto mb-8">
                                    <Smile className="w-12 h-12 text-apple-darkGray" />
                                </div>
                                <h2 className="text-2xl font-bold text-apple-black mb-4">Take a Selfie</h2>
                                <p className="text-apple-darkGray mb-10 leading-relaxed px-4">
                                    We'll use your selfie to scan <strong>{event.name}</strong> for every photo you appear in.
                                    Your selfie isn't stored — it's only used for matching.
                                </p>

                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="user"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={(e) => handleSelfieUpload(e.target.files[0])}
                                />

                                <div className="space-y-4">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full apple-button-primary !py-5 flex items-center justify-center space-x-3 text-lg shadow-lg shadow-blue-100 group"
                                    >
                                        <Camera className="w-6 h-6 group-active:scale-90 transition-transform" />
                                        <span>Open Camera</span>
                                    </button>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full apple-button-secondary !py-4 text-apple-darkGray flex items-center justify-center space-x-2"
                                    >
                                        <Upload className="w-5 h-5" />
                                        <span>Upload from Library</span>
                                    </button>
                                </div>
                            </motion.div>
                        ) : null}

                        {matching && (
                            <div className="text-center py-20">
                                <div className="relative w-32 h-32 mx-auto mb-10">
                                    {selfiePreview && (
                                        <img src={selfiePreview} className="w-full h-full object-cover rounded-full border-4 border-white shadow-xl grayscale" alt="Selfie" />
                                    )}
                                    <div className="absolute inset-0 border-4 border-apple-blue rounded-full animate-ping opacity-50"></div>
                                </div>
                                <h2 className="text-2xl font-bold text-apple-black mb-2 flex items-center justify-center gap-2">
                                    <Search className="w-6 h-6 text-apple-blue animate-pulse" />
                                    Finding your photos...
                                </h2>
                                <p className="text-apple-darkGray">Searching the event gallery powered by AI</p>
                            </div>
                        )}

                        {searched && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-8"
                            >
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-apple-black">
                                        {matches.length} {matches.length === 1 ? 'Match' : 'Matches'} Found
                                    </h2>
                                    <button
                                        onClick={() => { setSearched(false); setMatches([]); setSelfiePreview(null); }}
                                        className="text-apple-blue font-semibold hover:underline"
                                    >
                                        Try another selfie
                                    </button>
                                </div>

                                {matches.length === 0 ? (
                                    <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                                        <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
                                        <h3 className="text-xl font-bold mb-2">No matches found</h3>
                                        <p className="text-apple-darkGray leading-relaxed">
                                            We couldn't find your face in this event's photos.
                                            Try taking a clearer selfie with better lighting.
                                        </p>
                                        <button
                                            onClick={() => setSearched(false)}
                                            className="mt-8 apple-button-secondary font-bold"
                                        >
                                            Retake Selfie
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-8">
                                        {matches.map((photo, i) => (
                                            <motion.div
                                                key={photo._id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="apple-card overflow-hidden group shadow-lg"
                                            >
                                                <div className="relative overflow-hidden bg-gray-100">
                                                    <img
                                                        src={photo.url}
                                                        alt={`Match ${i + 1}`}
                                                        className="w-full h-auto object-contain max-h-[70vh]"
                                                    />
                                                </div>
                                                <div className="p-6 bg-white flex items-center justify-between border-t border-gray-100">
                                                    <div className="flex items-center text-green-600 font-bold">
                                                        <CheckCircle2 className="w-5 h-5 mr-2" />
                                                        Matched with AI
                                                    </div>
                                                    <a
                                                        href={photo.url}
                                                        download
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="apple-button-primary !py-2.5 !px-6 flex items-center gap-2 shadow-blue-100 shadow-lg"
                                                    >
                                                        <Download className="w-5 h-5" />
                                                        Download
                                                    </a>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}

                                <div className="text-center pt-10">
                                    <p className="text-apple-darkGray text-sm mb-6 flex items-center justify-center gap-2">
                                        <Sparkles className="w-4 h-4 text-apple-blue" />
                                        Matches powered by StarShot AI
                                    </p>
                                    <button
                                        onClick={() => { setSearched(false); setMatches([]); setSelfiePreview(null); }}
                                        className="apple-button-secondary !py-3 w-full max-w-xs font-bold"
                                    >
                                        Take New Selfie
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// Simple Clock Icon component if not imported
const Clock = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default FanPage;
