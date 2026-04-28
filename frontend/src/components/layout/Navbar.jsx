import { useTheme } from '../../context/ThemeContext';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, LogOut, Globe, KeyRound, Menu, X } from 'lucide-react';

const Navbar = ({ onMenuToggle, isMobileMenuOpen }) => {
    const { theme, toggleTheme } = useTheme();
    const { logout, user } = useAuth();
    const { t, i18n } = useTranslation();
    const location = useLocation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'ar' : 'en';
        i18n.changeLanguage(newLang);
    };

    const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'IT_ADMIN';

    // Get current page name for display
    const getPageName = () => {
        const path = location.pathname;
        if (path === '/') return t('dashboard');
        if (path.startsWith('/tickets/new')) return t('create_ticket');
        if (path.startsWith('/tickets/edit')) return t('edit');
        if (path.startsWith('/tickets')) return t('tickets');
        if (path === '/users') return t('user_management');
        if (path === '/change-password') return t('settings');
        return 'Libero';
    };

    return (
        <header className="h-16 bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-[#333] flex items-center justify-between px-4 md:px-6 transition-colors shadow-sm relative z-20">
            <div className="flex items-center gap-4">
                {/* Mobile Menu Toggle (Admin only) */}
                {isAdmin && (
                    <button 
                        onClick={onMenuToggle}
                        className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                )}

                {/* Logo & Page Title */}
                <div className="flex items-center gap-4">
                    <div className="font-black text-xl text-primary-600 dark:text-primary-500 tracking-tighter">Libero</div>
                    <div className="hidden sm:block h-6 w-px bg-gray-200 dark:bg-[#333]"></div>
                    <div className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{getPageName()}</div>
                </div>
            </div>

            {/* Center Navigation for Users */}
            {!isAdmin && (
                <nav className="hidden md:flex items-center bg-gray-100 dark:bg-[#252525] p-1 rounded-xl">
                    <NavLink to="/" className={({ isActive }) => `px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${isActive ? 'bg-white dark:bg-[#333] text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
                        {t('dashboard')}
                    </NavLink>
                    <NavLink to="/tickets" className={({ isActive }) => `px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${isActive ? 'bg-white dark:bg-[#333] text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
                        {t('tickets')}
                    </NavLink>
                </nav>
            )}

            <div className="flex items-center space-x-2 md:space-x-3">
                {/* Language Switcher */}
                <button 
                    onClick={toggleLanguage} 
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full border border-gray-200 dark:border-[#333] transition-all uppercase"
                >
                    <Globe className="w-3.5 h-3.5" />
                    {i18n.language}
                </button>

                <button onClick={toggleTheme} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                <div className="flex items-center border-l border-gray-200 dark:border-[#333] pl-2 md:pl-4 ml-1 md:ml-2">
                    <Link to="/change-password" title="Change Password" className="hidden sm:block mr-2 md:mr-4 p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-all">
                        <KeyRound className="w-5 h-5" />
                    </Link>
                    <span className="hidden sm:block text-sm font-medium mr-4 max-w-[100px] truncate">{user?.username}</span>
                    <button onClick={logout} className="text-gray-500 hover:text-red-500 transition-colors p-2">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
