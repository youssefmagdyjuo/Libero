import { NavLink, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Ticket, Users, PlusCircle, ChevronLeft, ChevronRight, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ isCollapsed, onToggle, isMobileOpen, onCloseMobile }) => {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/', icon: LayoutDashboard, label: t('dashboard') },
        { path: '/tickets', icon: Ticket, label: t('tickets') },
        { path: '/tickets/new', icon: PlusCircle, label: t('create_ticket') },
        { path: '/users', icon: Users, label: t('users'), adminOnly: true },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={onCloseMobile}
                />
            )}

            <aside className={`
                fixed inset-y-0 left-0 z-50 lg:relative lg:translate-x-0 transition-all duration-300
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64
                bg-white dark:bg-[#1e1e1e] border-r border-gray-200 dark:border-[#333] h-full flex flex-col group
            `}>
                {/* Toggle Button (Desktop Only) */}
                <button 
                    onClick={onToggle}
                    className="hidden lg:flex absolute -right-3 top-20 bg-primary-600 text-white rounded-full p-1 shadow-lg z-50 hover:bg-primary-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>

            {/* Logo Section */}
            <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center' : 'px-6'} border-b border-gray-200 dark:border-[#333]`}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8  rounded-lg flex items-center justify-center text-white font-bold shrink-0">
                        <img src="/libero.png" alt="" />
                    </div>
                    {!isCollapsed && <span className="text-xl font-bold text-gray-900 dark:text-white">Libero</span>}
                </div>
            </div>

            {/* Navigation Section */}
            <nav className="flex-1 px-3 py-6 space-y-2">
                {navItems.map((item) => (
                    (!item.adminOnly || user?.role === 'SUPER_ADMIN') && (
                        <NavLink 
                            key={item.path}
                            to={item.path} 
                            title={isCollapsed ? item.label : ''}
                            className={({ isActive }) => `
                                flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} py-3 
                                rounded-xl transition-all font-semibold overflow-hidden whitespace-nowrap
                                ${isActive 
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' 
                                    : 'text-gray-500 dark:text-gray-400 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 dark:hover:text-white'}
                            `}
                        >
                            <item.icon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} shrink-0`} />
                            {!isCollapsed && <span>{item.label}</span>}
                        </NavLink>
                    )
                ))}
            </nav>

            {/* User Info & Logout Section */}
            <div className="p-4 border-t border-gray-200 dark:border-[#333] space-y-4">
                {!isCollapsed && (
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#252525] flex items-center justify-center text-gray-500 shrink-0">
                            <UserIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.username}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.role.replace('_', ' ')}</p>
                        </div>
                    </div>
                )}
                
                <button 
                    onClick={handleLogout}
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} w-full py-3 text-red-600 dark:text-red-400 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 dark:hover:text-white rounded-xl transition-all font-medium overflow-hidden whitespace-nowrap`}
                    title={isCollapsed ? t('logout') : ''}
                >
                    <LogOut className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} shrink-0`} />
                    {!isCollapsed && <span>{t('logout')}</span>}
                </button>
            </div>
        </aside>
        </>
    );
};

export default Sidebar;
