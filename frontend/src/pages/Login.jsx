import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Shield, ShieldAlert, LogIn } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('demo123');
    const { login } = useAuth();
    const navigate = useNavigate();

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
        <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-[#121212] transition-colors">
            {/* Left side - Branding */}
            <div className="md:flex-1 bg-primary-600 dark:bg-primary-900 text-white flex flex-col justify-center items-start p-12 md:p-24 relative overflow-hidden hidden md:flex">
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
                <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 dark:opacity-20"></div>
                
                <h1 className="text-5xl font-extrabold mb-6 tracking-tight relative z-10">Libero</h1>
                <p className="text-xl text-primary-100 max-w-md relative z-10 font-light">
                    Next-generation lightweight hospital ticketing system. Streamlining care through better IT support.
                </p>
            </div>

            {/* Right side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
                <div className="max-w-md w-full">
                    <div className="md:hidden mb-10 text-center">
                        <h1 className="text-4xl font-extrabold text-primary-600 dark:text-primary-500 tracking-tight">Libero</h1>
                    </div>

                    <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-dark-border">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome back</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">Please enter your details to sign in.</p>

                        <form onSubmit={handleSubmit} className="space-y-5 mb-8">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Username</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:text-white transition-all" 
                                    value={username} 
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter your username"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                                <input 
                                    type="password" 
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:text-white transition-all" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="w-full py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium shadow-lg shadow-primary-500/30 transition-all flex items-center justify-center">
                                <LogIn className="w-4 h-4 mr-2" />
                                Sign In
                            </button>
                        </form>

                        <div className="relative mb-8">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-dark-border"></div></div>
                            <div className="relative flex justify-center text-sm"><span className="px-3 bg-white dark:bg-[#1e1e1e] text-gray-500 font-medium">Or quick login as</span></div>
                        </div>

                        <div className="space-y-3">
                            <button onClick={() => handleLogin('user')} className="w-full flex items-center p-3 rounded-xl border border-gray-200 dark:border-[#333] hover:border-primary-500 hover:bg-primary-600 dark:hover:bg-primary-600 transition-all group">
                                <div className="bg-primary-50 dark:bg-primary-900/20 p-2 rounded-lg group-hover:bg-white/20 transition-colors mr-4">
                                    <User className="w-5 h-5 text-primary-600 dark:text-primary-400 group-hover:text-white" />
                                </div>
                                <div className="text-left flex-1">
                                    <div className="font-semibold text-gray-900 dark:text-white group-hover:text-white text-sm transition-colors">Employee (USER)</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-white/80 transition-colors">Can create and view own tickets</div>
                                </div>
                            </button>

                            <button onClick={() => handleLogin('itadmin')} className="w-full flex items-center p-3 rounded-xl border border-gray-200 dark:border-[#333] hover:border-blue-500 hover:bg-blue-600 dark:hover:bg-blue-600 transition-all group">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg group-hover:bg-white/20 transition-colors mr-4">
                                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:text-white" />
                                </div>
                                <div className="text-left flex-1">
                                    <div className="font-semibold text-gray-900 dark:text-white group-hover:text-white text-sm transition-colors">IT Admin (IT_ADMIN)</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-white/80 transition-colors">Manage IT tickets & update status</div>
                                </div>
                            </button>

                            <button onClick={() => handleLogin('admin')} className="w-full flex items-center p-3 rounded-xl border border-gray-200 dark:border-[#333] hover:border-purple-500 hover:bg-purple-600 dark:hover:bg-purple-600 transition-all group">
                                <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg group-hover:bg-white/20 transition-colors mr-4">
                                    <ShieldAlert className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:text-white" />
                                </div>
                                <div className="text-left flex-1">
                                    <div className="font-semibold text-gray-900 dark:text-white group-hover:text-white text-sm transition-colors">Super Admin</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-white/80 transition-colors">Full system access & user management</div>
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
