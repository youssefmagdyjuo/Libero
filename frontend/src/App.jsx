import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';

import { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

const Layout = ({ children }) => {
    const { user } = useAuth();
    const { i18n } = useTranslation();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'IT_ADMIN';

    useEffect(() => {
        document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = i18n.language;
    }, [i18n.language]);

    if (!isAdmin) {
        // User Layout
        return (
            <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors">
                <Navbar onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} isMobileMenuOpen={isMobileMenuOpen} />
                <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        );
    }

    // Admin Layout
    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-dark-bg transition-colors">
            <Sidebar 
                isCollapsed={isSidebarCollapsed} 
                onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                isMobileOpen={isMobileMenuOpen}
                onCloseMobile={() => setIsMobileMenuOpen(false)}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} isMobileMenuOpen={isMobileMenuOpen} />
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
import ChangePassword from './pages/ChangePassword';
import EditTicket from './pages/EditTicket';
import TicketDetails from './pages/TicketDetails';

import { Toaster } from 'react-hot-toast';

function App() {
    return (
        <Router>
            <Toaster 
                position="top-right" 
                reverseOrder={false} 
                toastOptions={{
                    duration: 5000,
                }}
            />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/tickets" element={<PrivateRoute><Tickets /></PrivateRoute>} />
                <Route path="/tickets/:id" element={<PrivateRoute><TicketDetails /></PrivateRoute>} />
                <Route path="/tickets/new" element={<PrivateRoute><CreateTicket /></PrivateRoute>} />
                <Route path="/tickets/edit/:id" element={<PrivateRoute><EditTicket /></PrivateRoute>} />
                <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
                <Route path="/change-password" element={<PrivateRoute><ChangePassword /></PrivateRoute>} />
            </Routes>
        </Router>
    );
}

export default App;
