import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';

const Layout = ({ children }) => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'IT_ADMIN';

    if (!isAdmin) {
        // User Layout
        return (
            <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors">
                <Navbar />
                <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        );
    }

    // Admin Layout
    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-dark-bg transition-colors">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 bg-gray-100 dark:bg-[#181818]">
                    {children}
                </main>
            </div>
        </div>
    );
};

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

import CreateTicket from './pages/CreateTicket';
import Users from './pages/Users';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/tickets" element={<PrivateRoute><Tickets /></PrivateRoute>} />
                <Route path="/tickets/new" element={<PrivateRoute><CreateTicket /></PrivateRoute>} />
                <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
            </Routes>
        </Router>
    );
}

export default App;
