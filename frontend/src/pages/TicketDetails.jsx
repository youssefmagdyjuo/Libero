import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    ArrowLeft, Calendar, User, Tag, Clock, 
    AlertTriangle, Edit3, Trash2, CheckCircle, 
    MessageSquare, Send, Loader2, Phone, MapPin,
    FileText, Mic
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/common/ConfirmModal';

const TicketDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'IT_ADMIN';

    useEffect(() => {
        fetchTicket();
    }, [id]);

    const fetchTicket = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`http://localhost:5000/api/tickets/${id}`);
            setTicket(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch ticket');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/tickets/${id}`);
            toast.success('Ticket deleted successfully');
            navigate('/tickets');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete ticket');
        }
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'Pending': return 'bg-orange-50 text-orange-700 border-orange-200';
            case 'In Progress': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'Solved': return 'bg-green-50 text-green-700 border-green-200';
            case 'Cancelled': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
    );

    if (error || !ticket) return (
        <div className="max-w-2xl mx-auto mt-12 text-center">
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-100 dark:border-red-900/30">
                <p className="text-red-600 dark:text-red-400 font-medium">{error || 'Ticket not found'}</p>
                <button onClick={() => navigate('/tickets')} className="mt-4 text-sm font-semibold text-primary-600 hover:underline">
                    Back to Tickets
                </button>
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto py-8">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <button 
                    onClick={() => navigate('/tickets')}
                    className="flex items-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to List
                </button>

                <div className="flex gap-3 w-full md:w-auto">
                    {((ticket.user_id === user?.id && !ticket.is_locked && ticket.status === 'Pending') || isAdmin) && (
                        <Link 
                            to={`/tickets/edit/${id}`}
                            className="flex-1 md:flex-none flex items-center justify-center px-4 py-2 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333] text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525] transition-all font-medium"
                        >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit Issue
                        </Link>
                    )}
                    {((ticket.user_id === user?.id && ticket.status === 'Pending') || isAdmin) && (
                        <button 
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="flex-1 md:flex-none flex items-center justify-center px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all font-medium"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-100 dark:border-[#333] shadow-sm overflow-hidden">
                        <div className="p-6 md:p-8 border-b border-gray-100 dark:border-[#333]">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-xs font-bold tracking-wider text-primary-600 dark:text-primary-400 uppercase">
                                    {ticket.ticket_key}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(ticket.status)}`}>
                                    {ticket.status}
                                </span>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                {ticket.title}
                            </h1>
                            <div className="prose dark:prose-invert max-w-none">
                                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
                                    {ticket.description}
                                </p>
                            </div>
                        </div>

                        {/* Additional Meta Info */}
                        <div className="p-6 bg-gray-50/50 dark:bg-[#252525]/50 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Location</p>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Floor {ticket.floor || '-'}, {ticket.department || 'No Dept'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Contact</p>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {ticket.phone || 'No phone provided'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Tag className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Type</p>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {ticket.issue_type}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Attachments Section */}
                        {ticket.attachments && ticket.attachments.length > 0 && (
                            <div className="p-6 md:p-8 border-t border-gray-100 dark:border-[#333]">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center">
                                    <FileText className="w-4 h-4 mr-2 text-primary-500" />
                                    Attachments
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {ticket.attachments.map((file) => (
                                        <div key={file.id} className="p-4 bg-gray-50 dark:bg-[#252525] rounded-xl border border-gray-100 dark:border-[#333]">
                                            {file.file_type === 'image' ? (
                                                <div className="space-y-3">
                                                    <img 
                                                        src={`http://localhost:5000/${file.file_path.replace(/\\/g, '/')}`} 
                                                        alt="Attachment" 
                                                        className="w-full h-48 object-cover rounded-lg cursor-zoom-in hover:opacity-90 transition-opacity"
                                                        onClick={() => window.open(`http://localhost:5000/${file.file_path.replace(/\\/g, '/')}`, '_blank')}
                                                    />
                                                    <p className="text-xs text-gray-500 text-center font-medium">Image Attachment</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-center p-4 bg-primary-50 dark:bg-primary-900/10 rounded-lg mb-3">
                                                        <Mic className="w-8 h-8 text-primary-500" />
                                                    </div>
                                                    <audio controls className="w-full h-8">
                                                        <source src={`http://localhost:5000/${file.file_path.replace(/\\/g, '/')}`} type="audio/wav" />
                                                        Your browser does not support the audio element.
                                                    </audio>
                                                    <p className="text-xs text-gray-500 text-center font-medium">Voice Recording</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-100 dark:border-[#333] p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-6">
                            Ticket Details
                        </h3>
                        
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center text-gray-500 text-sm">
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    Priority
                                </div>
                                <span className={`text-sm font-bold ${
                                    ticket.priority === 'High' ? 'text-red-600' : 
                                    ticket.priority === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                                }`}>
                                    {ticket.priority}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center text-gray-500 text-sm">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Created
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {new Date(ticket.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            {isAdmin && (
                                <div className="pt-4 border-t border-gray-100 dark:border-[#333]">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-3">System Checks</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-600 dark:text-gray-400">Locked for User?</span>
                                        <span className={`text-xs font-bold ${(ticket.is_locked || ticket.status !== 'Pending') ? 'text-red-600' : 'text-green-600'}`}>
                                            {(ticket.is_locked || ticket.status !== 'Pending') ? 'YES' : 'NO'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Ticket"
                message="Are you sure you want to delete this ticket? This action cannot be undone."
                confirmText="Delete Ticket"
            />
        </div>
    );
};

export default TicketDetails;
