import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Search, Edit, Trash2, Plus, Shield, ShieldAlert, User } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const Users = () => {
    const { t } = useTranslation();
    const { user } = useAuth();

    // Protect this route manually if somehow accessed
    if (user?.role !== 'SUPER_ADMIN') {
        return <Navigate to="/" />;
    }

    const mockUsers = [
        { id: 1, username: 'admin', role: 'SUPER_ADMIN', active: true, email: 'admin@libero.local', created: '2023-01-15' },
        { id: 2, username: 'itadmin', role: 'IT_ADMIN', active: true, email: 'it.support@libero.local', created: '2023-03-22' },
        { id: 3, username: 'user', role: 'USER', active: true, email: 'nurse.station@libero.local', created: '2023-06-10' },
        { id: 4, username: 'jdoe', role: 'USER', active: false, email: 'jdoe@libero.local', created: '2024-01-05' },
    ];

    const getRoleIcon = (role) => {
        switch(role) {
            case 'SUPER_ADMIN': return <ShieldAlert className="w-4 h-4 text-purple-500 mr-2" />;
            case 'IT_ADMIN': return <Shield className="w-4 h-4 text-blue-500 mr-2" />;
            default: return <User className="w-4 h-4 text-gray-500 mr-2" />;
        }
    };

    const getRoleBadge = (role) => {
        switch(role) {
            case 'SUPER_ADMIN': return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-900/50';
            case 'IT_ADMIN': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900/50';
            default: return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
                    <p className="text-gray-500 text-sm">Create, edit, and manage system access.</p>
                </div>
                
                <div className="flex gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search users..." 
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                        />
                    </div>
                    <button className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center">
                        <Plus className="w-4 h-4 mr-2" />
                        Add User
                    </button>
                </div>
            </div>
            
            <div className="bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-200 dark:border-[#333] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-[#333] bg-gray-50/50 dark:bg-[#252525]">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-[#333]">
                            {mockUsers.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-sm mr-4">
                                                {u.username.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-200">{u.username}</div>
                                                <div className="text-xs text-gray-500 mt-1">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadge(u.role)}`}>
                                            {getRoleIcon(u.role)}
                                            {u.role.replace('_', ' ')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.active ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${u.active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                            {u.active ? 'Active' : 'Disabled'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 rounded-lg transition-colors">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            {u.role !== 'SUPER_ADMIN' && (
                                                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
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

export default Users;
