import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Filter, Search, Eye, Loader2, Trash2, FileSpreadsheet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ConfirmModal from '../components/common/ConfirmModal';

const Tickets = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [priorityFilter, setPriorityFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const [departmentFilter, setDepartmentFilter] = useState('All');
    const [dateFrom, setDateFrom] = useState('');
    const [exporting, setExporting] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
    const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'IT_ADMIN';

    useEffect(() => {
        fetchTickets();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, statusFilter, priorityFilter, typeFilter, departmentFilter, dateFrom, tickets]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:5000/api/tickets');
            setTickets(res.data);
        } catch (err) {
            console.error('Failed to fetch tickets:', err);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let result = [...tickets];

        if (statusFilter !== 'All') {
            result = result.filter(t => t.status === statusFilter);
        }

        if (priorityFilter !== 'All') {
            result = result.filter(t => t.priority === priorityFilter);
        }

        if (typeFilter !== 'All') {
            result = result.filter(t => t.issue_type === typeFilter);
        }

        if (departmentFilter !== 'All') {
            result = result.filter(t => t.department === departmentFilter);
        }

        if (dateFrom) {
            const from = new Date(dateFrom);
            result = result.filter(t => new Date(t.created_at) >= from);
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(t => 
                t.title.toLowerCase().includes(term) || 
                t.ticket_key.toLowerCase().includes(term) ||
                (t.issue_type && t.issue_type.toLowerCase().includes(term))
            );
        }

        setFilteredTickets(result);
    };

    const buildExportParams = () => {
        const params = {};

        if (statusFilter !== 'All') params.status = statusFilter;
        if (priorityFilter !== 'All') params.priority = priorityFilter;
        if (typeFilter !== 'All') params.issue_type = typeFilter;
        if (departmentFilter !== 'All') params.department = departmentFilter;
        if (dateFrom) params.dateFrom = dateFrom;
        if (searchTerm) params.q = searchTerm;

        return params;
    };

    const handleExport = async () => {
        try {
            setExporting(true);
            const res = await axios.get('http://localhost:5000/api/tickets/export', {
                params: buildExportParams(),
                responseType: 'blob'
            });

            const blob = new Blob([res.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'tickets.xlsx';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to export tickets');
        } finally {
            setExporting(false);
        }
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'Pending': return 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-900/50';
            case 'In Progress': return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-900/50';
            case 'Solved': return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900/50';
            case 'Cancelled': return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-900/50';
            default: return 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
        }
    };

    const getPriorityIcon = (priority) => {
        switch(priority) {
            case 'High': return <span className="text-red-500 font-bold">↑</span>;
            case 'Medium': return <span className="text-yellow-500 font-bold">=</span>;
            case 'Low': return <span className="text-green-500 font-bold">↓</span>;
            default: return null;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/tickets/${id}`);
            toast.success('Ticket deleted successfully');
            setDeleteModal({ isOpen: false, id: null });
            fetchTickets();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete ticket');
        }
    };

    return (
        <div className={isAdmin ? "" : "max-w-5xl mx-auto mt-4"}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('tickets')}</h1>
                    <p className="text-gray-500 text-sm">{t('tickets_subtitle')}</p>
                </div>
                
                <div className="flex flex-wrap items-stretch gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="w-4 h-4 absolute start-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder={t('search_tickets')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full ps-9 pe-4 py-2 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                        />
                    </div>
                    
                    <div className="relative w-full sm:w-auto">
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full sm:w-auto min-w-40 pl-3 pr-8 py-2 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333] rounded-lg text-sm text-gray-600 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none cursor-pointer"
                        >
                            <option value="All">{t('all_status')}</option>
                            <option value="Pending">{t('pending')}</option>
                            <option value="In Progress">{t('in_progress')}</option>
                            <option value="Solved">{t('solved')}</option>
                            <option value="Cancelled">{t('cancelled')}</option>
                        </select>
                        <Filter className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>

                    {isAdmin && (
                        <>
                            <div className="relative w-full sm:w-auto">
                                <select
                                    value={priorityFilter}
                                    onChange={(e) => setPriorityFilter(e.target.value)}
                                    className="w-full sm:w-auto min-w-40 pl-3 pr-8 py-2 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333] rounded-lg text-sm text-gray-600 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none cursor-pointer"
                                >
                                    <option value="All">All Priorities</option>
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                                <Filter className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>

                            <div className="relative w-full sm:w-auto">
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="w-full sm:w-auto min-w-40 pl-3 pr-8 py-2 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333] rounded-lg text-sm text-gray-600 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none cursor-pointer"
                                >
                                    <option value="All">All Types</option>
                                    <option value="IT">IT</option>
                                    <option value="Hospital">Hospital</option>
                                </select>
                                <Filter className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>

                            <div className="relative w-full sm:w-auto">
                                <select
                                    value={departmentFilter}
                                    onChange={(e) => setDepartmentFilter(e.target.value)}
                                    className="w-full sm:w-auto min-w-44 pl-3 pr-8 py-2 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333] rounded-lg text-sm text-gray-600 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none cursor-pointer"
                                >
                                    <option value="All">All Departments</option>
                                    {[...new Set(tickets.map((x) => x.department).filter(Boolean))].map((dept) => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                                <Filter className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>

                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full sm:w-40 px-3 py-2 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333] rounded-lg text-sm text-gray-600 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                aria-label="Created date from"
                            />

                            <button
                                onClick={handleExport}
                                disabled={exporting}
                                className="w-full sm:w-auto justify-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors shadow-sm inline-flex items-center gap-2 whitespace-nowrap"
                                title="Export filtered tickets to Excel"
                            >
                                <FileSpreadsheet className="w-4 h-4" />
                                {exporting ? 'Exporting...' : 'Export to Excel'}
                            </button>
                        </>
                    )}

                    {!isAdmin && (
                        <Link to="/tickets/new" className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
                            {t('create_ticket')}
                        </Link>
                    )}
                </div>
            </div>
            
            <div className="bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-200 dark:border-[#333] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-[#333] bg-gray-50/50 dark:bg-[#252525]">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('key')}</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('summary')}</th>
                                {isAdmin && <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('type')}</th>}
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('status')}</th>
                                {isAdmin && <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('priority')}</th>}
                                {isAdmin && <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('info')}</th>}
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">{t('date')}</th>
                                <th className="px-4 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-[#333]">
                            {loading ? (
                                <tr>
                                    <td colSpan={isAdmin ? 8 : 4} className="px-6 py-10 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-500 mb-2" />
                                        <span className="text-gray-500">Loading tickets...</span>
                                    </td>
                                </tr>
                            ) : filteredTickets.length === 0 ? (
                                <tr>
                                    <td colSpan={isAdmin ? 8 : 4} className="px-6 py-10 text-center text-gray-500">
                                        No tickets found matching your criteria.
                                    </td>
                                </tr>
                            ) : filteredTickets.map((ticket) => (
                                <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link to={`/tickets/${ticket.id}`} className="text-sm font-medium text-gray-900 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                            {ticket.ticket_key}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link to={`/tickets/${ticket.id}`} className="block">
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-200 group-hover:text-primary-600 transition-colors">{ticket.title}</div>
                                        </Link>
                                    </td>
                                    {isAdmin && (
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase border ${
                                                ticket.issue_type === 'IT' 
                                                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' 
                                                : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800'
                                            }`}>
                                                {ticket.issue_type}
                                            </span>
                                        </td>
                                    )}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(ticket.status)}`}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    {isAdmin && (
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                                                {getPriorityIcon(ticket.priority)}
                                                <span className="ml-2">{ticket.priority}</span>
                                            </div>
                                        </td>
                                    )}
                                    {isAdmin && (
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600 dark:text-gray-400">
                                            <div>{ticket.department}</div>
                                            <div>Floor: {ticket.floor}</div>
                                        </td>
                                    )}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                        {formatDate(ticket.created_at)}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => setDeleteModal({ isOpen: true, id: ticket.id })}
                                                title="Delete Ticket"
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                            <Link 
                                                to={`/tickets/${ticket.id}`}
                                                title="View Details"
                                                className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmModal 
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null })}
                onConfirm={() => handleDelete(deleteModal.id)}
                title="Delete Ticket"
                message="Are you sure you want to delete this ticket? This action cannot be undone."
                confirmText="Delete Ticket"
            />
        </div>
    );
};

export default Tickets;
