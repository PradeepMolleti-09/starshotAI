import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { Camera } from 'lucide-react';

const Login = () => {
    const { user, loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [loginError, setLoginError] = useState(null);

    if (user) {
        return <Navigate to="/dashboard" />;
    }

    const handleLogin = async () => {
        if (isLoggingIn) return;

        setIsLoggingIn(true);
        setLoginError(null);

        try {
            console.log("Starting Google Login...");
            await loginWithGoogle();
            console.log("Login successful, navigating to dashboard...");
            navigate('/dashboard');
        } catch (error) {
            console.error("Login failed:", error);
            if (error.code === 'auth/popup-blocked') {
                setLoginError("Sign-in popup was blocked by your browser. Please allow popups for this site.");
            } else if (error.code === 'auth/cancelled-popup-request') {
                setLoginError("Login process was interrupted. Please try again.");
            } else {
                setLoginError("An unexpected error occurred during login. Please try again.");
            }
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="min-h-screen pt-20 flex items-center justify-center bg-apple-gray px-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center"
            >
                <div className="w-16 h-16 bg-apple-blue rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                    <Camera className="w-8 h-8 text-white" />
                </div>

                <h1 className="text-3xl font-bold text-apple-black mb-4">Photographer Portal</h1>
                <p className="text-apple-darkGray mb-8 leading-relaxed">
                    Sign in to create events, manage galleries, and generate scannable QR codes for your fans.
                </p>

                {loginError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium">
                        {loginError}
                    </div>
                )}

                <button
                    onClick={handleLogin}
                    disabled={isLoggingIn}
                    className="w-full flex items-center justify-center space-x-3 apple-button-secondary border border-gray-200 !py-4 hover:bg-gray-50 transition-all font-semibold disabled:opacity-50"
                >
                    {isLoggingIn ? (
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-apple-blue border-t-transparent rounded-full animate-spin"></div>
                            <span>Signing in...</span>
                        </div>
                    ) : (
                        <>
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                            <span>Continue with Google</span>
                        </>
                    )}
                </button>

                <div className="mt-12 text-sm text-apple-darkGray">
                    <p className="mb-2 text-apple-black font-semibold uppercase tracking-widest text-[10px]">Secure Photographer Interface</p>
                    <p>Guests can access their photos by scanning your event's unique QR code.</p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
