import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { Send, X, Loader2, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const EditTicket = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'IT_ADMIN';
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        issue_type: '',
        phone: '',
        floor: '',
        department: '',
        description: '',
        priority: '',
        status: ''
    });

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                // We'll need a get single ticket endpoint or filter from list
                // For now, we'll fetch all and filter or assume there's a GET /api/tickets/:id
                const res = await axios.get(`http://localhost:5000/api/tickets`);
                const ticket = res.data.find(t => t.id === parseInt(id));
                
                if (!ticket) {
                    setError('Ticket not found');
                    return;
                }

                setFormData({
                    title: ticket.title,
                    issue_type: ticket.issue_type,
                    phone: ticket.phone || '',
                    floor: ticket.floor || '',
                    department: ticket.department || '',
                    description: ticket.description,
                    priority: ticket.priority,
                    status: ticket.status
                });

                // Check time limit for normal users
                if (!isAdmin && ticket.is_locked) {
                    setError('You cannot edit this issue because the allowed time has passed.');
                }
            } catch (err) {
                setError('Failed to fetch ticket details');
            } finally {
                setLoading(false);
            }
        };

        fetchTicket();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            await axios.put(`http://localhost:5000/api/tickets/${id}`, formData);
            toast.success('Ticket updated successfully!');
            navigate('/tickets');
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update ticket';
            setError(msg);
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Ticket</h1>
                    <p className="text-gray-500 text-sm">Update the details of this request.</p>
                </div>
                <button onClick={() => navigate('/tickets')} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-gray-100 dark:border-[#333] overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Issue Title</label>
                            <input 
                                type="text" 
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:text-white transition-all" 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Issue Type</label>
                            <select 
                                value={formData.issue_type}
                                onChange={(e) => setFormData({...formData, issue_type: e.target.value})}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:text-white transition-all"
                            >
                                <option>IT</option>
                                <option>System/PrimeCare</option>
                            </select>
                        </div>

                        {isAdmin && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Priority</label>
                                <select 
                                    value={formData.priority}
                                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:text-white transition-all font-bold text-primary-600"
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                        )}

                        {isAdmin && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
                                <select 
                                    value={formData.status}
                                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:text-white transition-all font-bold"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Solved">Solved</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone Number</label>
                            <input 
                                type="tel" 
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:text-white transition-all" 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Floor</label>
                            <input 
                                type="text" 
                                value={formData.floor}
                                onChange={(e) => setFormData({...formData, floor: e.target.value})}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:text-white transition-all" 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Department</label>
                            <input 
                                type="text" 
                                value={formData.department}
                                onChange={(e) => setFormData({...formData, department: e.target.value})}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:text-white transition-all" 
                            />
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Detailed Description</label>
                            <textarea 
                                rows="4"
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:text-white transition-all resize-none" 
                            ></textarea>
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end gap-3 border-t border-gray-100 dark:border-[#333]">
                        <button type="button" disabled={saving} onClick={() => navigate('/tickets')} className="px-5 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#333] font-medium transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving || (!!error && !loading)} className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium shadow-lg shadow-primary-500/30 transition-all flex items-center justify-center min-w-[140px] disabled:opacity-50">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                <>
                                    <Save className="w-4 h-4 ml-2 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTicket;
