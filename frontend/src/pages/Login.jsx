import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Shield, ShieldAlert, LogIn, Globe } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('demo123');
    const { login } = useAuth();
    const navigate = useNavigate();
    const { i18n, t } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'ar' : 'en';
        i18n.changeLanguage(newLang);
        document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = newLang;
    };

    const handleLogin = async (userType) => {
        await login(userType, password);
        navigate('/');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(username, password);
        navigate('/');
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-[#121212] transition-colors relative">
            {/* Language Toggle - Top Right */}
            <button
                onClick={toggleLanguage}
                className="absolute top-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-full border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1e1e1e] text-gray-600 dark:text-gray-400 hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all shadow-sm uppercase"
            >
                <Globe className="w-3.5 h-3.5" />
                {i18n.language === 'en' ? 'العربية' : 'English'}
            </button>
            {/* Left side - Branding */}
            <div className="md:flex-1 bg-primary-600 dark:bg-primary-900 text-white flex flex-col justify-center items-start p-12 md:p-24 relative overflow-hidden hidden md:flex">
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
                <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 dark:opacity-20"></div>

                <h1 className="text-5xl font-extrabold mb-6 tracking-tight relative z-10">Libero</h1>
                <p className="text-xl text-primary-100 max-w-md relative z-10 font-light">
                    {t('login_branding_desc')}</p>
            </div>

            {/* Right side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
                <div className="max-w-md w-full">
                    <div className="md:hidden mb-10 text-center">
                        <h1 className="text-4xl font-extrabold text-primary-600 dark:text-primary-500 tracking-tight">Libero</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xs mx-auto">{t('login_branding_desc')}</p>
                    </div>

                    <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-dark-border">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('welcome_back')}</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">{t('welcome_back_sub')}</p>

                        <form onSubmit={handleSubmit} className="space-y-5 mb-8">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('username')}</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:text-white transition-all"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder={t('enter_username')}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('password')}</label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:text-white transition-all"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="w-full py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium shadow-lg shadow-primary-500/30 transition-all flex items-center justify-center">
                                <LogIn className="w-4 h-4 mr-2" />
                                {t('sign_in')}
                            </button>
                        </form>

                        <div className="relative mb-8">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-dark-border"></div></div>
                            <div className="relative flex justify-center text-sm"><span className="px-3 bg-white dark:bg-[#1e1e1e] text-gray-500 font-medium">{t('or_quick_login')}</span></div>
                        </div>

                        <div className="space-y-3">
                            <button onClick={() => handleLogin('user')} className="w-full flex items-center p-3 rounded-xl border border-gray-200 dark:border-[#333] hover:border-primary-500 hover:bg-primary-600 dark:hover:bg-primary-600 transition-all group">
                                <div className="bg-primary-50 dark:bg-primary-900/20 p-2 rounded-lg group-hover:bg-white/20 transition-colors mr-4">
                                    <User className="w-5 h-5 text-primary-600 dark:text-primary-400 group-hover:text-white" />
                                </div>
                                <div className="text-left flex-1">
                                    <div className="font-semibold text-gray-900 dark:text-white group-hover:text-white text-sm transition-colors">{t('employee_role')}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-white/80 transition-colors">{t('employee_desc')}</div>
                                </div>
                            </button>

                            <button onClick={() => handleLogin('itadmin')} className="w-full flex items-center p-3 rounded-xl border border-gray-200 dark:border-[#333] hover:border-blue-500 hover:bg-blue-600 dark:hover:bg-blue-600 transition-all group">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg group-hover:bg-white/20 transition-colors mr-4">
                                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:text-white" />
                                </div>
                                <div className="text-left flex-1">
                                    <div className="font-semibold text-gray-900 dark:text-white group-hover:text-white text-sm transition-colors">IT Admin (IT_ADMIN)</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-white/80 transition-colors">{t('it_admin_desc')}</div>
                                </div>
                            </button>

                            <button onClick={() => handleLogin('admin')} className="w-full flex items-center p-3 rounded-xl border border-gray-200 dark:border-[#333] hover:border-purple-500 hover:bg-purple-600 dark:hover:bg-purple-600 transition-all group">
                                <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg group-hover:bg-white/20 transition-colors mr-4">
                                    <ShieldAlert className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:text-white" />
                                </div>
                                <div className="text-left flex-1">
                                    <div className="font-semibold text-gray-900 dark:text-white group-hover:text-white text-sm transition-colors">Super Admin</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-white/80 transition-colors">{t('super_admin_desc')}</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
