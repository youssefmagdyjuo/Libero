import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Check, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AVATARS = [
    { key: 'owl_green', bg: 'bg-emerald-500', label: 'Owl (Green)' },
    { key: 'owl_blue', bg: 'bg-blue-500', label: 'Owl (Blue)' },
    { key: 'owl_purple', bg: 'bg-purple-500', label: 'Owl (Purple)' },
    { key: 'fox_orange', bg: 'bg-orange-500', label: 'Fox (Orange)' },
    { key: 'cat_pink', bg: 'bg-pink-500', label: 'Cat (Pink)' },
    { key: 'robot_slate', bg: 'bg-slate-600', label: 'Robot (Slate)' }
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

    const currentKey = user?.avatar_key || null;
    const current = useMemo(() => AVATARS.find((a) => a.key === currentKey) || null, [currentKey]);

    const pick = async (key) => {
        if (saving) return;
        try {
            setSaving(true);
            await updateAvatar(key);
            toast.success(t('avatar_updated'));
        } catch (e) {
            toast.error(e.response?.data?.message || t('avatar_update_failed'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('profile')}</h1>
                <p className="text-gray-500 text-sm">{t('profile_subtitle')}</p>
            </div>

            <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-gray-100 dark:border-[#333] overflow-hidden">
                <div className="p-6 md:p-8 border-b border-gray-100 dark:border-[#333] flex items-center gap-4">
                    <div
                        className={`h-14 w-14 rounded-2xl flex items-center justify-center text-white font-black text-lg ${
                            current?.bg || 'bg-primary-600'
                        }`}
                        title={current?.label || t('default_avatar')}
                    >
                        {initials(user?.username)}
                    </div>
                    <div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{user?.username}</div>
                        <div className="text-xs text-gray-500">{user?.role}</div>
                    </div>
                </div>

                <div className="p-6 md:p-8">
                    <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
                        <h2 className="text-sm font-black uppercase tracking-wider text-gray-700 dark:text-gray-200">
                            {t('choose_avatar')}
                        </h2>
                        {saving && (
                            <div className="text-xs text-gray-500 flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {t('saving')}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {AVATARS.map((a) => {
                            const selected = a.key === currentKey;
                            return (
                                <button
                                    key={a.key}
                                    type="button"
                                    onClick={() => pick(a.key)}
                                    disabled={saving}
                                    className={`group relative p-4 rounded-2xl border transition-all text-left ${
                                        selected
                                            ? 'border-primary-500 ring-2 ring-primary-500/30'
                                            : 'border-gray-200 dark:border-[#333] hover:border-primary-300'
                                    } bg-gray-50 dark:bg-[#252525] disabled:opacity-60`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`h-12 w-12 rounded-2xl flex items-center justify-center text-white font-black ${
                                                a.bg
                                            }`}
                                        >
                                            {initials(user?.username)}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                                {a.label}
                                            </div>
                                            <div className="text-xs text-gray-500 truncate">{a.key}</div>
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

