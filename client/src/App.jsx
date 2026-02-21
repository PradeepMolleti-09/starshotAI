import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EventManagement from './pages/EventManagement';
import FanPage from './pages/FanPage';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <AuthProvider>
            <div className="min-h-screen">
                <Navbar />
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/event/:eventId" element={<ProtectedRoute><EventManagement /></ProtectedRoute>} />
                    <Route path="/fan/:eventId" element={<FanPage />} />
                </Routes>
            </div>
        </AuthProvider>
    );
}

export default App;
