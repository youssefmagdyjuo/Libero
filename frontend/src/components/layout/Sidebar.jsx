import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Ticket, Users, PlusCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const { t } = useTranslation();
    const { user } = useAuth();

    return (
        <aside className="w-64 bg-white dark:bg-dark-surface border-r border-gray-200 dark:border-dark-border h-full flex flex-col transition-colors">
            <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-dark-border">
                <span className="text-xl font-bold text-primary-600 dark:text-primary-500">Libero</span>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
                <Link to="/" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-md transition-colors">
                    <LayoutDashboard className="w-5 h-5 mr-3" />
                    {t('dashboard')}
                </Link>
                <Link to="/tickets" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-md transition-colors">
                    <Ticket className="w-5 h-5 mr-3" />
                    {t('tickets')}
                </Link>
                <Link to="/tickets/new" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-md transition-colors">
                    <PlusCircle className="w-5 h-5 mr-3" />
                    {t('create_ticket')}
                </Link>
                {user?.role === 'SUPER_ADMIN' && (
                    <Link to="/users" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-md transition-colors">
                        <Users className="w-5 h-5 mr-3" />
                        {t('users')}
                    </Link>
                )}
            </nav>
        </aside>
    );
};

export default Sidebar;
