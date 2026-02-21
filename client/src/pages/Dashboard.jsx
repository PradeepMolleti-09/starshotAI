import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, Image as ImageIcon, Users, QrCode, MoreHorizontal, X, Clock, Trash2, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { format, formatDistance } from 'date-fns';

const Dashboard = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newEvent, setNewEvent] = useState({ name: '', expiryDays: '30' });
    const [selectedQR, setSelectedQR] = useState(null);
    const [eventToDelete, setEventToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, [user]);

    const fetchEvents = async () => {
        try {
            const { data } = await axios.get(`/api/events/photographer/${user.uid}`);
            setEvents(data);
        } catch (error) {
            console.error("Failed to fetch events:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/events', {
                ...newEvent,
                photographerId: user.uid
            });
            setShowModal(false);
            setNewEvent({ name: '', expiryDays: '30' });
            fetchEvents();
        } catch (error) {
            console.error("Failed to create event:", error);
        }
    };

    const handleDeleteEvent = async () => {
        if (!eventToDelete) return;
        setDeleting(true);
        try {
            await axios.delete(`/api/events/${eventToDelete._id}`);
            setEventToDelete(null);
            fetchEvents();
        } catch (error) {
            console.error("Failed to delete event:", error);
            alert("Failed to delete event. Please try again.");
        } finally {
            setDeleting(false);
        }
    };

    const stats = {
        totalEvents: events.length,
        totalPhotos: events.reduce((acc, curr) => acc + (curr.photoCount || 0), 0),
        activeFans: events.reduce((acc, curr) => acc + (curr.fanCount || 0), 0),
    };

    const downloadQR = (eventId, eventName) => {
        const canvas = document.getElementById(`qr-${eventId}`);
        if (!canvas) return;
        const pngUrl = canvas.toDataURL("image/png");
        let downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `QR-${eventName}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    if (loading) return (
        <div className="pt-32 text-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-apple-blue mx-auto"></div>
        </div>
    );

    return (
        <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-apple-black mb-2 tracking-tight">Welcome, {user.displayName.split(' ')[0]}</h1>
                    <p className="text-apple-darkGray font-medium">Manage your events and photo deliveries.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="apple-button-primary flex items-center justify-center space-x-2 shadow-lg shadow-blue-200"
                >
                    <Plus className="w-5 h-5" />
                    <span>New Event</span>
                </button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
                {[
                    { icon: <Calendar className="text-apple-blue" />, label: "Total Events", value: stats.totalEvents },
                    { icon: <ImageIcon className="text-purple-500" />, label: "Photos Uploaded", value: stats.totalPhotos },
                    { icon: <Users className="text-green-500" />, label: "Matched Fans", value: stats.activeFans }
                ].map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className="apple-card p-6 flex items-center space-x-4 border-none bg-apple-gray/50"
                    >
                        <div className="p-3 bg-white rounded-2xl shadow-sm">{stat.icon}</div>
                        <div>
                            <p className="text-sm text-apple-darkGray font-semibold">{stat.label}</p>
                            <p className="text-2xl font-bold text-apple-black tracking-tight">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.length === 0 ? (
                    <div className="col-span-full py-20 text-center apple-card bg-apple-gray/30 border-dashed border-2">
                        <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-apple-darkGray font-medium">No events created yet. Click "New Event" to get started.</p>
                    </div>
                ) : (
                    events.map((event, idx) => {
                        const isExpired = new Date(event.expiryDate) < new Date() || event.isExpired;
                        const timeRemaining = formatDistance(new Date(event.expiryDate), new Date(), { addSuffix: true });

                        return (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                layout
                                key={event._id}
                                className={`apple-card p-6 flex flex-col h-full relative group ${isExpired ? 'opacity-75 grayscale-[0.5]' : ''}`}
                            >
                                <button
                                    onClick={() => setEventToDelete(event)}
                                    className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>

                                <div className="flex justify-between items-start mb-6 pr-8">
                                    <div>
                                        <h3 className="text-xl font-bold text-apple-black mb-1 line-clamp-1">{event.name}</h3>
                                        <p className="text-sm text-apple-darkGray font-medium">{format(new Date(event.date), 'MMMM dd, yyyy')}</p>
                                    </div>
                                    {isExpired ? (
                                        <span className="px-3 py-1 bg-red-50 text-red-500 text-[10px] font-bold rounded-full uppercase tracking-wider">Expired</span>
                                    ) : (
                                        <span className="px-3 py-1 bg-green-50 text-green-500 text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                            Active
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-4 mb-8 flex-grow">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-apple-darkGray font-medium">Photos</span>
                                        <span className="text-apple-black font-bold">{event.photoCount || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-apple-darkGray font-medium">Expires</span>
                                        <span className={`font-bold ${isExpired ? 'text-red-500' : 'text-apple-blue'}`}>
                                            {isExpired ? 'Expired' : timeRemaining}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mt-auto">
                                    <Link
                                        to={`/event/${event._id}`}
                                        className="apple-button-secondary !py-2.5 text-sm font-semibold"
                                    >
                                        Manage
                                    </Link>
                                    <button
                                        onClick={() => setSelectedQR(event)}
                                        className="apple-button-secondary !py-2.5 text-sm font-semibold !bg-apple-black !text-white hover:!bg-black/80 flex items-center justify-center gap-2"
                                    >
                                        <QrCode className="w-4 h-4" />
                                        QR Code
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Create Event Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl w-full max-w-md p-10 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold tracking-tight">New Event</h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-apple-gray rounded-full transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateEvent} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold mb-2 ml-1 text-apple-black">Event Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Paris Fashion Week 2026"
                                        className="w-full px-5 py-4 bg-apple-gray rounded-2xl border-none focus:ring-2 focus:ring-apple-blue transition-all outline-none"
                                        value={newEvent.name}
                                        onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2 ml-1 text-apple-black">Photo Expiry</label>
                                    <select
                                        className="w-full px-5 py-4 bg-apple-gray rounded-2xl border-none focus:ring-2 focus:ring-apple-blue transition-all outline-none appearance-none"
                                        value={newEvent.expiryDays}
                                        onChange={(e) => setNewEvent({ ...newEvent, expiryDays: e.target.value })}
                                    >
                                        <option value="30">30 Days</option>
                                        <option value="60">60 Days</option>
                                        <option value="90">90 Days</option>
                                    </select>
                                </div>
                                <button type="submit" className="w-full apple-button-primary !py-4 shadow-lg shadow-blue-100 font-bold text-lg">
                                    Create Event
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {eventToDelete && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl text-center"
                        >
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Trash2 className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Delete Event?</h2>
                            <p className="text-apple-darkGray mb-8 leading-relaxed">
                                This will permanently delete <strong>{eventToDelete.name}</strong> and all its {eventToDelete.photoCount} photos. This action cannot be undone.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleDeleteEvent}
                                    disabled={deleting}
                                    className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
                                >
                                    {deleting ? 'Deleting...' : 'Yes, Delete Everything'}
                                </button>
                                <button
                                    onClick={() => setEventToDelete(null)}
                                    className="w-full py-4 bg-apple-gray text-apple-black rounded-2xl font-bold hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* QR Modal */}
            <AnimatePresence>
                {selectedQR && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl text-center"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">Event QR Code</h2>
                                <button onClick={() => setSelectedQR(null)} className="p-2 hover:bg-apple-gray rounded-full transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="bg-white p-6 rounded-3xl border border-gray-100 mb-8 inline-block shadow-sm">
                                <QRCodeSVG
                                    id={`qr-${selectedQR._id}`}
                                    value={`${window.location.origin}/fan/${selectedQR._id}`}
                                    size={200}
                                    level="H"
                                    includeMargin={true}
                                />
                            </div>

                            <p className="text-apple-darkGray text-sm mb-8 leading-relaxed">
                                Fans scan this to find their photos.<br />
                                <strong>{selectedQR.name}</strong>
                            </p>

                            <div className="space-y-3">
                                <button
                                    onClick={() => downloadQR(selectedQR._id, selectedQR.name)}
                                    className="w-full apple-button-primary !py-3 font-semibold"
                                >
                                    Download Image
                                </button>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(`${window.location.origin}/fan/${selectedQR._id}`);
                                        alert('Link copied to clipboard!');
                                    }}
                                    className="w-full apple-button-secondary !py-3 flex items-center justify-center gap-2 font-semibold"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Copy Link
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
