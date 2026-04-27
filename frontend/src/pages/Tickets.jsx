import { useTranslation } from 'react-i18next';
import { Filter, Search, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Tickets = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'IT_ADMIN';

    const mockTickets = [
        { id: 'T-101', title: 'Network issue in floor 3', status: 'Open', priority: 'High', issueType: 'IT', creator: 'John Doe', date: '2 hours ago' },
        { id: 'T-102', title: 'Printer not working in HR', status: 'In Progress', priority: 'Medium', issueType: 'IT', creator: 'Jane Smith', date: '5 hours ago' },
        { id: 'T-103', title: 'Need access to shared drive', status: 'Closed', priority: 'Low', issueType: 'System', creator: 'Mike Johnson', date: '1 day ago' },
    ];

    const getStatusBadge = (status) => {
        switch(status) {
            case 'Open': return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-900/50';
            case 'In Progress': return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/50';
            case 'Closed': return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900/50';
            default: return 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
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

    return (
        <div className={isAdmin ? "" : "max-w-5xl mx-auto mt-4"}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('tickets')}</h1>
                    <p className="text-gray-500 text-sm">Manage and track all support requests.</p>
                </div>
                
                <div className="flex gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search tickets..." 
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                        />
                    </div>
                    <button className="p-2 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333] rounded-lg text-gray-500 hover:text-primary-600 transition-colors">
                        <Filter className="w-4 h-4" />
                    </button>
                    {!isAdmin && (
                        <Link to="/tickets/new" className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
                            Create
                        </Link>
                    )}
                </div>
            </div>
            
            <div className="bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-200 dark:border-[#333] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-[#333] bg-gray-50/50 dark:bg-[#252525]">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Key</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Summary</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('status')}</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                                {isAdmin && <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Requester</th>}
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Updated</th>
                                <th className="px-4 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-[#333]">
                            {mockTickets.map((ticket) => (
                                <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors group cursor-pointer">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                            {ticket.id}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-200">{ticket.title}</div>
                                        <div className="text-xs text-gray-500 mt-1">{ticket.issueType}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(ticket.status)}`}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                                            {getPriorityIcon(ticket.priority)}
                                            <span className="ml-2">{ticket.priority}</span>
                                        </div>
                                    </td>
                                    {isAdmin && (
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                            {ticket.creator}
                                        </td>
                                    )}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                        {ticket.date}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-right">
                                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Tickets;
