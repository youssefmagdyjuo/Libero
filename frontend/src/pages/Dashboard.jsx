import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Ticket, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'IT_ADMIN';

    if (!isAdmin) {
        return (
            <div className="max-w-4xl mx-auto mt-8">
                <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-8 border border-gray-100 dark:border-[#333] shadow-sm mb-8">
                    <h1 className="text-3xl font-bold mb-2">Hello, {user?.username}</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Welcome to Libero IT Support. How can we help you today?</p>
                    <Link to="/tickets/new" className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium shadow-lg shadow-primary-500/30 transition-all">
                        <Ticket className="w-5 h-5 mr-2" />
                        Submit New Ticket
                    </Link>
                </div>

                <h2 className="text-xl font-bold mb-4">Your Recent Tickets</h2>
                <div className="bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-100 dark:border-[#333] overflow-hidden">
                    <div className="p-8 text-center text-gray-500">
                        <Ticket className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                        <p>You have no recent tickets.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                <p className="text-gray-500">Overview of system tickets and performance.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-xl border border-gray-100 dark:border-[#333] shadow-sm flex items-center">
                    <div className="p-3 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 mr-4">
                        <Ticket className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Tickets</p>
                        <h3 className="text-2xl font-bold">45</h3>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-xl border border-gray-100 dark:border-[#333] shadow-sm flex items-center">
                    <div className="p-3 rounded-lg bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 mr-4">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">In Progress</p>
                        <h3 className="text-2xl font-bold">12</h3>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-xl border border-gray-100 dark:border-[#333] shadow-sm flex items-center">
                    <div className="p-3 rounded-lg bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 mr-4">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Resolved</p>
                        <h3 className="text-2xl font-bold">28</h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-xl border border-gray-100 dark:border-[#333] shadow-sm flex items-center">
                    <div className="p-3 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 mr-4">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Escalated</p>
                        <h3 className="text-2xl font-bold">5</h3>
                    </div>
                </div>
            </div>

            {/* Placeholder for charts or recent activity */}
            <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-xl border border-gray-100 dark:border-[#333] shadow-sm">
                <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
                <div className="space-y-4">
                    <div className="flex items-center text-sm">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mr-3"></div>
                        <span className="text-gray-900 dark:text-white font-medium mr-2">T-101</span>
                        <span className="text-gray-500">status changed to In Progress</span>
                        <span className="ml-auto text-gray-400 text-xs">2 mins ago</span>
                    </div>
                    <div className="flex items-center text-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-3"></div>
                        <span className="text-gray-900 dark:text-white font-medium mr-2">T-098</span>
                        <span className="text-gray-500">was closed by Admin</span>
                        <span className="ml-auto text-gray-400 text-xs">1 hr ago</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
