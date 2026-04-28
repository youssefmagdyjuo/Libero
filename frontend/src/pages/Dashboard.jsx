import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Ticket, Clock, CheckCircle, AlertCircle, ChevronRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, solved: 0 });
    const [loading, setLoading] = useState(true);
    const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'IT_ADMIN';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/tickets');
            const userTickets = isAdmin ? res.data : res.data.filter(t => t.user_id === user?.id);
            setTickets(userTickets.slice(0, 5)); // Show only recent 5

            // Calculate stats
            setStats({
                total: userTickets.length,
                pending: userTickets.filter(t => t.status === 'Pending').length,
                inProgress: userTickets.filter(t => t.status === 'In Progress').length,
                solved: userTickets.filter(t => t.status === 'Solved').length
            });
        } catch (err) {
            console.error('Failed to fetch dashboard data', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isAdmin) {
        return (
            <div className="max-w-5xl mx-auto py-8 px-4">
                {/* Welcome Header */}
                <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl p-8 md:p-12 border border-gray-100 dark:border-[#333] shadow-sm mb-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-700"></div>
                    <div className="relative z-10">
                        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3">Welcome back, {user?.username}! 👋</h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-lg">Your IT support portal is ready. Check your ticket status or report a new issue below.</p>
                        <Link to="/tickets/new" className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-bold shadow-xl shadow-primary-500/20 transition-all hover:-translate-y-0.5">
                            <Plus className="w-5 h-5 mr-2" />
                            Create New Ticket
                        </Link>
                    </div>
                </div>

                {/* User Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
                    <div className="bg-white dark:bg-[#1e1e1e] p-5 rounded-2xl border border-gray-100 dark:border-[#333] shadow-sm">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total</p>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white">{stats.total}</h3>
                    </div>
                    <div className="bg-white dark:bg-[#1e1e1e] p-5 rounded-2xl border border-gray-100 dark:border-[#333] shadow-sm">
                        <p className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-1">Pending</p>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white">{stats.pending}</h3>
                    </div>
                    <div className="bg-white dark:bg-[#1e1e1e] p-5 rounded-2xl border border-gray-100 dark:border-[#333] shadow-sm">
                        <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Active</p>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white">{stats.inProgress}</h3>
                    </div>
                    <div className="bg-white dark:bg-[#1e1e1e] p-5 rounded-2xl border border-gray-100 dark:border-[#333] shadow-sm">
                        <p className="text-xs font-bold text-green-500 uppercase tracking-wider mb-1">Solved</p>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white">{stats.solved}</h3>
                    </div>
                </div>

                {/* Recent Tickets */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">Recent Activity</h2>
                    <Link to="/tickets" className="text-sm font-bold text-primary-600 hover:underline">View All Tickets</Link>
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <div className="animate-pulse space-y-4">
                            {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 dark:bg-[#252525] rounded-2xl"></div>)}
                        </div>
                    ) : tickets.length > 0 ? (
                        tickets.map((ticket) => (
                            <Link 
                                key={ticket.id} 
                                to={`/tickets/${ticket.id}`}
                                className="flex items-center p-5 bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-100 dark:border-[#333] hover:border-primary-500/50 hover:shadow-md transition-all group"
                            >
                                <div className={`p-3 rounded-xl mr-4 ${
                                    ticket.status === 'Solved' ? 'bg-green-50 text-green-600' :
                                    ticket.status === 'In Progress' ? 'bg-blue-50 text-blue-600' :
                                    'bg-orange-50 text-orange-600'
                                }`}>
                                    <Ticket className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-primary-600 uppercase tracking-tighter">{ticket.ticket_key}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                            ticket.status === 'Solved' ? 'bg-green-100 text-green-700' :
                                            ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                            'bg-orange-100 text-orange-700'
                                        }`}>
                                            {ticket.status}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-gray-900 dark:text-white truncate">{ticket.title}</h4>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                            </Link>
                        ))
                    ) : (
                        <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl border border-dashed border-gray-200 dark:border-[#333] p-12 text-center">
                            <div className="w-20 h-20 bg-gray-50 dark:bg-[#252525] rounded-full flex items-center justify-center mx-auto mb-4">
                                <Ticket className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No tickets yet</h3>
                            <p className="text-gray-500 mb-6">You haven't reported any issues. Click the button above to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white">Admin Hub</h1>
                <p className="text-gray-500 dark:text-gray-400">Total control over system issues and resolutions.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl border border-gray-100 dark:border-[#333] shadow-sm flex items-center hover:-translate-y-1 transition-all">
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 mr-4">
                        <Ticket className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total</p>
                        <h3 className="text-2xl font-black">{stats.total}</h3>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl border border-gray-100 dark:border-[#333] shadow-sm flex items-center hover:-translate-y-1 transition-all">
                    <div className="p-3 rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 mr-4">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Pending</p>
                        <h3 className="text-2xl font-black">{stats.pending}</h3>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl border border-gray-100 dark:border-[#333] shadow-sm flex items-center hover:-translate-y-1 transition-all">
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 mr-4">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active</p>
                        <h3 className="text-2xl font-black">{stats.inProgress}</h3>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl border border-gray-100 dark:border-[#333] shadow-sm flex items-center hover:-translate-y-1 transition-all">
                    <div className="p-3 rounded-xl bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 mr-4">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Solved</p>
                        <h3 className="text-2xl font-black">{stats.solved}</h3>
                    </div>
                </div>
            </div>

            {/* Admin Recent Activity */}
            <div className="bg-white dark:bg-[#1e1e1e] p-8 rounded-2xl border border-gray-100 dark:border-[#333] shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black">Latest System Activity</h3>
                    <Link to="/tickets" className="text-xs font-bold uppercase text-primary-600 hover:underline">Full Audit Log</Link>
                </div>
                <div className="space-y-6">
                    {tickets.map(t => (
                        <div key={t.id} className="flex items-center text-sm border-l-2 border-gray-100 dark:border-[#333] pl-6 relative">
                            <div className={`absolute left-[-5px] w-2 h-2 rounded-full ${
                                t.status === 'Solved' ? 'bg-green-500' :
                                t.status === 'In Progress' ? 'bg-blue-500' : 'bg-orange-500'
                            }`}></div>
                            <span className="font-bold text-primary-600 mr-3">{t.ticket_key}</span>
                            <span className="text-gray-500">New ticket submitted by employee</span>
                            <span className="ml-auto font-medium text-gray-400">{new Date(t.created_at).toLocaleTimeString()}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
