import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { KeyRound, ShieldCheck, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const ChangePassword = () => {
    const { logout } = useAuth();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (formData.newPassword.length < 4) {
            setError('Password must be at least 4 characters long');
            return;
        }

        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/auth/change-password', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });
            setSuccess(true);
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            
            // Optionally log out user after password change
            // setTimeout(() => logout(), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-200 dark:border-[#333] shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-[#333] bg-gray-50/50 dark:bg-[#252525]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400">
                            <KeyRound className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Change Password</h1>
                            <p className="text-sm text-gray-500">Update your account security.</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-900/50 rounded-xl text-green-600 dark:text-green-400 text-sm flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Password changed successfully!
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                        <input 
                            type="password" 
                            required
                            value={formData.currentPassword}
                            onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-xl focus:ring-2 focus:ring-primary-500/50 outline-none transition-all dark:text-white"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="pt-2 border-t border-gray-100 dark:border-[#333]">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                        <input 
                            type="password" 
                            required
                            value={formData.newPassword}
                            onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-xl focus:ring-2 focus:ring-primary-500/50 outline-none transition-all dark:text-white"
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                        <input 
                            type="password" 
                            required
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-xl focus:ring-2 focus:ring-primary-500/50 outline-none transition-all dark:text-white"
                            placeholder="••••••••"
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full mt-4 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                <ShieldCheck className="w-4 h-4 mr-2" />
                                Update Password
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
