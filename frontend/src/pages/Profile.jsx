import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Check, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AVATARS = [
    { url: '/avatars/doc_male.png', label: 'Doctor (Male)' },
    { url: '/avatars/nurse_female.png', label: 'Nurse (Female)' },
    { url: '/avatars/it_guy.png', label: 'IT Admin (Male)' },
    { url: '/avatars/office_female.png', label: 'Manager (Female)' },
    { url: '/avatars/paramedic_male.png', label: 'Paramedic (Male)' },
    { url: '/avatars/staff_generic.png', label: 'Staff (Female)' }
];

function initials(username) {
    const u = String(username || '').trim();
    if (!u) return 'U';
    return u.slice(0, 2).toUpperCase();
}

const Profile = () => {
    const { t } = useTranslation();
    const { user, updateAvatar } = useAuth();
    const [saving, setSaving] = useState(false);

    const currentUrl = user?.avatar || null;
    const current = useMemo(() => AVATARS.find((a) => a.url === currentUrl) || null, [currentUrl]);

    const pick = async (url) => {
        if (saving) return;
        try {
            setSaving(true);
            await updateAvatar(url);
            toast.success(t('avatar_updated'));
        } catch (e) {
            toast.error(e.response?.data?.message || t('avatar_update_failed'));
        } finally {
            setSaving(false);
        }
    };

    const generateRandom = async () => {
        const randomSeed = Math.random().toString(36).substring(7);
        const url = `https://api.dicebear.com/7.x/micah/svg?seed=${randomSeed}&backgroundType=gradientLinear`;
        pick(url);
    };

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-700 dark:text-white">{t('profile')}</h1>
                    <p className="text-gray-500 text-sm">{t('profile_subtitle')}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-gray-100 dark:border-[#333] overflow-hidden">
                <div className="p-6 md:p-8 border-b border-gray-100 dark:border-[#333] flex items-center gap-4">
                    {currentUrl ? (
                        <img
                            src={currentUrl}
                            alt="Current avatar"
                            className="h-16 w-16 rounded-2xl object-cover bg-gray-50 border border-gray-200 dark:border-[#333] shadow-sm"
                        />
                    ) : (
                        <div
                            className="h-16 w-16 rounded-2xl flex items-center justify-center text-white font-black text-xl bg-primary-600 shadow-sm"
                            title={t('default_avatar')}
                        >
                            {initials(user?.username)}
                        </div>
                    )}
                    <div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{user?.username}</div>
                        <div className="text-xs text-gray-500 font-medium tracking-wide">{user?.role}</div>
                        {current?.label && <div className="text-xs text-primary-600 font-medium mt-1">{current.label}</div>}
                    </div>
                </div>

                <div className="p-6 md:p-8">
                    <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
                        <h2 className="text-sm font-black uppercase tracking-wider text-gray-700 dark:text-gray-200">
                            {t('choose_avatar')}
                        </h2>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={generateRandom}
                                disabled={saving}
                                className="text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/40 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                            >
                                🎲 Random Avatar
                            </button>
                            {saving && (
                                <div className="text-xs text-gray-500 flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {t('saving')}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {AVATARS.map((a) => {
                            const selected = a.url === currentUrl;
                            return (
                                <button
                                    key={a.url}
                                    type="button"
                                    onClick={() => pick(a.url)}
                                    disabled={saving}
                                    className={`group relative p-4 rounded-2xl border transition-all text-left ${selected
                                            ? 'border-primary-500 ring-2 ring-primary-500/30'
                                            : 'border-gray-200 dark:border-[#333] hover:border-primary-300'
                                        } bg-gray-50 dark:bg-[#252525] disabled:opacity-60 flex flex-col items-center gap-3`}
                                >
                                    <img
                                        src={a.url}
                                        alt={a.label}
                                        className="h-16 w-16 rounded-xl object-cover bg-white dark:bg-[#1e1e1e] border border-gray-100 dark:border-[#333] shadow-sm group-hover:scale-105 transition-transform"
                                    />
                                    <div className="text-center w-full">
                                        <div className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                            {a.label}
                                        </div>
                                    </div>

                                    {selected && (
                                        <div className="absolute top-3 right-3 inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary-600 text-white shadow">
                                            <Check className="w-4 h-4" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;

