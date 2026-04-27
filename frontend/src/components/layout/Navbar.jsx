import { useTheme } from '../../context/ThemeContext';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, LogOut, Globe } from 'lucide-react';

const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const { logout, user } = useAuth();
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'ar' : 'en';
        i18n.changeLanguage(newLang);
        document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    };

    return (
        <header className="h-16 bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-[#333] flex items-center justify-between px-6 transition-colors shadow-sm relative z-10">
            <div className="flex items-center space-x-6">
                {/* Show logo if sidebar is hidden (i.e. regular USER layout) */}
                {user?.role === 'USER' && (
                    <div className="font-bold text-xl text-primary-600 dark:text-primary-500 tracking-tight">Libero</div>
                )}
                
                {user?.role === 'USER' && (
                    <nav className="hidden md:flex space-x-1">
                        <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#333] transition-colors">
                            Dashboard
                        </Link>
                        <Link to="/tickets" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#333] transition-colors">
                            My Tickets
                        </Link>
                    </nav>
                )}
            </div>
            <div className="flex items-center space-x-3">
                <button onClick={toggleLanguage} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                    <Globe className="w-5 h-5" />
                </button>
                <button onClick={toggleTheme} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <div className="flex items-center border-l border-gray-200 dark:border-dark-border pl-4 ml-2">
                    <span className="text-sm font-medium mr-4">{user?.username}</span>
                    <button onClick={logout} className="text-gray-500 hover:text-red-500 transition-colors">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
