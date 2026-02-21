import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Camera, LogOut, LayoutDashboard, User } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-[100] nav-glass">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-3 group">
                    <motion.div
                        whileHover={{ rotate: -10, scale: 1.1 }}
                        className="w-10 h-10 bg-gradient-to-tr from-apple-blue to-blue-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20"
                    >
                        <Camera className="w-6 h-6 text-white" />
                    </motion.div>
                    <div className="flex flex-col">
                        <span className="font-bold text-xl tracking-tight text-apple-black leading-none group-hover:text-apple-blue transition-colors">StarShot AI</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-apple-dark-gray leading-none mt-1">Professional</span>
                    </div>
                </Link>

                <div className="flex items-center space-x-8">
                    {user ? (
                        <>
                            <Link to="/dashboard" className="flex items-center space-x-2 text-sm font-bold text-apple-black hover:text-apple-blue transition-colors">
                                <LayoutDashboard className="w-4 h-4" />
                                <span>Dashboard</span>
                            </Link>
                            <div className="flex items-center space-x-4 pl-6 border-l border-gray-100">
                                <div className="flex items-center space-x-3">
                                    <img
                                        src={user.photoURL}
                                        alt={user.displayName}
                                        className="w-9 h-9 rounded-full border-2 border-white shadow-sm"
                                    />
                                    <div className="hidden md:block">
                                        <p className="text-sm font-bold text-apple-black leading-none">{user.displayName.split(' ')[0]}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2.5 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all text-apple-dark-gray"
                                    title="Sign Out"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <Link to="/login" className="apple-button-primary !py-2.5 !px-6 text-sm">
                            Photographer Portal
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
