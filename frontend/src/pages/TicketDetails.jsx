import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    ArrowLeft, Calendar, Tag, 
    AlertTriangle, Edit3, Trash2, 
    MessageSquare, Send, Loader2, Phone, MapPin,
    FileText, Mic, Check, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ConfirmModal from '../components/common/ConfirmModal';

const TicketDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useTranslation();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [sendingComment, setSendingComment] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editDraft, setEditDraft] = useState('');
    const [savingEdit, setSavingEdit] = useState(false);
    const [commentDeleteId, setCommentDeleteId] = useState(null);
    const socketRef = useRef(null);
    const chatScrollRef = useRef(null);
    const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'IT_ADMIN';

    const HOUR_24_MS = 24 * 60 * 60 * 1000;
    const canModifyComment = (c) => {
        if (Number(c.user_id) !== Number(user?.id)) return false;
        return Date.now() - new Date(c.created_at).getTime() <= HOUR_24_MS;
    };

    useEffect(() => {
        fetchTicket();
    }, [id]);

    const fetchComments = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/tickets/${id}/ticket-comments`);
            const list = Array.isArray(res.data) ? res.data : [];
            setComments(list);
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'تعذر تحميل الرسائل';
            toast.error(msg);
        }
    };

    useEffect(() => {
        if (!id || !user) return;
        fetchComments();
    }, [id, user]);

    useEffect(() => {
        if (!id) return;
        const token = localStorage.getItem('token');
        if (!token) return;

        const socket = io('http://localhost:5000', { auth: { token } });
        socketRef.current = socket;
        socket.emit('ticket:join', { ticketId: Number(id) });
        socket.on('ticket:comment', (msg) => {
            if (Number(msg.ticket_id) !== Number(id)) return;
            setComments((prev) => {
                if (prev.some((c) => Number(c.id) === Number(msg.id))) return prev;
                return [
                    ...prev,
                    {
                        id: msg.id,
                        ticket_id: msg.ticket_id,
                        user_id: msg.user_id,
                        username: msg.username,
                        avatar: msg.avatar,
                        content: msg.content,
                        created_at: msg.created_at
                    }
                ].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            });
        });

        socket.on('ticket:comment:updated', (msg) => {
            if (Number(msg.ticket_id) !== Number(id)) return;
            setComments((prev) =>
                prev.map((c) =>
                    Number(c.id) === Number(msg.id) ? { ...c, content: msg.content } : c
                )
            );
        });

        socket.on('ticket:comment:deleted', (msg) => {
            if (Number(msg.ticket_id) !== Number(id)) return;
            setComments((prev) => prev.filter((c) => Number(c.id) !== Number(msg.id)));
            setEditingCommentId((eid) => (Number(eid) === Number(msg.id) ? null : eid));
        });

        return () => {
            socket.emit('ticket:leave', { ticketId: Number(id) });
            socket.removeAllListeners();
            socket.disconnect();
            socketRef.current = null;
        };
    }, [id]);

    useEffect(() => {
        const el = chatScrollRef.current;
        if (!el) return;
        requestAnimationFrame(() => {
            el.scrollTop = el.scrollHeight;
        });
    }, [comments, id]);

    const handleSendComment = async (e) => {
        e?.preventDefault?.();
        const text = commentText.trim();
        if (!text || sendingComment) return;
        setSendingComment(true);
        try {
            const res = await axios.post(`http://localhost:5000/api/tickets/${id}/comments`, {
                content: text
            });
            const row = res.data;
            if (row && row.id != null) {
                setComments((prev) => {
                    if (prev.some((c) => Number(c.id) === Number(row.id))) return prev;
                    const next = [
                        ...prev,
                        {
                            id: row.id,
                            ticket_id: row.ticket_id,
                            user_id: row.user_id,
                            username: row.username,
                            avatar: row.avatar,
                            content: row.content,
                            created_at: row.created_at
                        }
                    ];
                    return next.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                });
            }
            setCommentText('');
            await fetchComments();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send message');
        } finally {
            setSendingComment(false);
        }
    };

    const startEdit = (c) => {
        setEditingCommentId(c.id);
        setEditDraft(c.content);
    };

    const cancelEdit = () => {
        setEditingCommentId(null);
        setEditDraft('');
    };

    const saveEdit = async () => {
        const text = editDraft.trim();
        if (!text || savingEdit || editingCommentId == null) return;
        setSavingEdit(true);
        try {
            await axios.patch(
                `http://localhost:5000/api/tickets/${id}/comments/${editingCommentId}`,
                { content: text }
            );
            setComments((prev) =>
                prev.map((c) =>
                    Number(c.id) === Number(editingCommentId) ? { ...c, content: text } : c
                )
            );
            cancelEdit();
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            if (String(msg).toLowerCase().includes('24 hour')) {
                toast.error(t('comment_window_expired'));
            } else {
                toast.error(msg);
            }
        } finally {
            setSavingEdit(false);
        }
    };

    const confirmDeleteComment = async () => {
        if (commentDeleteId == null) return;
        try {
            await axios.delete(
                `http://localhost:5000/api/tickets/${id}/comments/${commentDeleteId}`
            );
            setComments((prev) => prev.filter((c) => Number(c.id) !== Number(commentDeleteId)));
            setCommentDeleteId(null);
            if (Number(editingCommentId) === Number(commentDeleteId)) cancelEdit();
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            if (String(msg).toLowerCase().includes('24 hour')) {
                toast.error(t('comment_window_expired'));
            } else {
                toast.error(msg);
            }
        }
    };

    const fetchTicket = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`http://localhost:5000/api/tickets/${id}`);
            setTicket(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch ticket');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/tickets/${id}`);
            toast.success('Ticket deleted successfully');
            navigate('/tickets');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete ticket');
        }
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'Pending': return 'bg-orange-50 text-orange-700 border-orange-200';
            case 'In Progress': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'Solved': return 'bg-green-50 text-green-700 border-green-200';
            case 'Cancelled': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
    );

    if (error || !ticket) return (
        <div className="max-w-2xl mx-auto mt-12 text-center">
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-100 dark:border-red-900/30">
                <p className="text-red-600 dark:text-red-400 font-medium">{error || t('ticket_not_found')}</p>
                <button onClick={() => navigate('/tickets')} className="mt-4 text-sm font-semibold text-primary-600 hover:underline">
                    {t('back_to_tickets_btn')}
                </button>
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto py-8">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <button 
                    onClick={() => navigate('/tickets')}
                    className="flex items-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('back_to_tickets')}
                </button>

                <div className="flex gap-3 w-full md:w-auto">
                    {((ticket.user_id === user?.id && !ticket.is_locked && ticket.status === 'Pending') || isAdmin) && (
                        <Link 
                            to={`/tickets/edit/${id}`}
                            className="flex-1 md:flex-none flex items-center justify-center px-4 py-2 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333] text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525] transition-all font-medium"
                        >
                            <Edit3 className="w-4 h-4 mr-2" />
                            {t('edit_issue')}
                        </Link>
                    )}
                    {((ticket.user_id === user?.id && ticket.status === 'Pending') || isAdmin) && (
                        <button 
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="flex-1 md:flex-none flex items-center justify-center px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all font-medium"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t('delete_ticket')}
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-100 dark:border-[#333] shadow-sm overflow-hidden">
                        <div className="p-6 md:p-8 border-b border-gray-100 dark:border-[#333]">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-xs font-bold tracking-wider text-primary-600 dark:text-primary-400 uppercase">
                                    {ticket.ticket_key}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(ticket.status)}`}>
                                    {ticket.status}
                                </span>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-700 dark:text-white mb-4">
                                {ticket.title}
                            </h1>
                            <div className="prose dark:prose-invert max-w-none">
                                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
                                    {ticket.description}
                                </p>
                            </div>
                        </div>

                        {/* Additional Meta Info */}
                        <div className="p-6 bg-gray-50/50 dark:bg-[#252525]/50 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">{t('location')}</p>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {t('floor_label')} {ticket.floor || '-'}, {ticket.department || t('no_dept')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">{t('contact')}</p>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {ticket.phone || t('no_phone')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Tag className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">{t('type')}</p>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {ticket.issue_type}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Attachments Section */}
                        {ticket.attachments && ticket.attachments.length > 0 && (
                            <div className="p-6 md:p-8 border-t border-gray-100 dark:border-[#333]">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center">
                                    <FileText className="w-4 h-4 mr-2 text-primary-500" />
                                    {t('attachments_label')}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {ticket.attachments.map((file) => (
                                        <div key={file.id} className="p-4 bg-gray-50 dark:bg-[#252525] rounded-xl border border-gray-100 dark:border-[#333]">
                                            {file.file_type === 'image' ? (
                                                <div className="space-y-3">
                                                    <img 
                                                        src={`http://localhost:5000/${file.file_path.replace(/\\/g, '/')}`} 
                                                        alt="Attachment" 
                                                        className="w-full h-48 object-cover rounded-lg cursor-zoom-in hover:opacity-90 transition-opacity"
                                                        onClick={() => window.open(`http://localhost:5000/${file.file_path.replace(/\\/g, '/')}`, '_blank')}
                                                    />
                                                    <p className="text-xs text-gray-500 text-center font-medium">{t('image_attachment')}</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-center p-4 bg-primary-50 dark:bg-primary-900/10 rounded-lg mb-3">
                                                        <Mic className="w-8 h-8 text-primary-500" />
                                                    </div>
                                                    <audio controls className="w-full h-8">
                                                        <source src={`http://localhost:5000/${file.file_path.replace(/\\/g, '/')}`} type="audio/wav" />
                                                        Your browser does not support the audio element.
                                                    </audio>
                                                    <p className="text-xs text-gray-500 text-center font-medium">{t('voice_recording')}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-100 dark:border-[#333] shadow-sm overflow-hidden">
                        <div className="p-6 md:p-8 border-b border-gray-100 dark:border-[#333]">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center">
                                <MessageSquare className="w-4 h-4 mr-2 text-primary-500" />
                                {t('ticket_discussion')}
                            </h3>
                        </div>
                        {/* dir=ltr يثبت يسار/يمين الشاشة بغض النظر عن لغة الواجهة */}
                        <div
                            ref={chatScrollRef}
                            dir="ltr"
                            className="p-4 md:p-6 max-h-80 overflow-y-auto space-y-3 scroll-smooth"
                        >
                            {comments.length === 0 ? (
                                <p
                                    dir="auto"
                                    className="text-sm text-gray-500 dark:text-gray-400 text-center py-4"
                                >
                                    {t('no_comments_yet')}
                                </p>
                            ) : (
                                comments.map((c) => {
                                    const isMine = Number(c.user_id) === Number(user?.id);
                                    const isEditing = Number(editingCommentId) === Number(c.id);
                                    const showActions = isMine && canModifyComment(c) && !isEditing;
                                    return (
                                        <div
                                            key={`comment-${c.id}`}
                                            className={`flex w-full gap-3 ${isMine ? 'justify-start' : 'justify-end'}`}
                                        >
                                            {!isMine && c.avatar && (
                                                <img src={c.avatar} alt="Avatar" className="w-8 h-8 rounded-full border border-gray-200 dark:border-[#333] shadow-sm bg-gray-50 flex-shrink-0" />
                                            )}
                                            {!isMine && !c.avatar && (
                                                <div className="w-8 h-8 rounded-full bg-primary-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                                                    {String(c.username || '').slice(0,2).toUpperCase()}
                                                </div>
                                            )}
                                            
                                            <div
                                                className={`max-w-[min(85%,20rem)] px-3 py-2.5 rounded-2xl border shadow-sm ${
                                                    isMine
                                                        ? 'rounded-tl-sm bg-primary-100 text-gray-900 border-primary-200/90 dark:bg-[#134e2e] dark:border-emerald-700/80 dark:text-white'
                                                        : 'rounded-tr-sm bg-gray-100 dark:bg-[#2a2a2a] border-gray-200 dark:border-[#404040]'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                                                    <span
                                                        dir="auto"
                                                        className={`text-xs font-bold ${
                                                            isMine
                                                                ? 'text-primary-900 dark:text-emerald-100'
                                                                : 'text-gray-800 dark:text-gray-100'
                                                        }`}
                                                    >
                                                        {c.username}
                                                    </span>
                                                    <div className="flex items-center gap-1.5">
                                                        <span
                                                            className={`text-[10px] tabular-nums ${
                                                                isMine
                                                                    ? 'text-primary-800/80 dark:text-emerald-200/90'
                                                                    : 'text-gray-500 dark:text-gray-400'
                                                            }`}
                                                        >
                                                            {new Date(c.created_at).toLocaleString()}
                                                        </span>
                                                        {showActions && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => startEdit(c)}
                                                                    className="p-0.5 rounded text-primary-800 hover:bg-primary-200/60 dark:text-emerald-100 dark:hover:bg-emerald-800/50"
                                                                    title={t('comment_edit')}
                                                                >
                                                                    <Edit3 className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setCommentDeleteId(c.id)}
                                                                    className="p-0.5 rounded text-red-700 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-900/40"
                                                                    title={t('comment_delete')}
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                {isEditing ? (
                                                    <div className="space-y-2 mt-1">
                                                        <textarea
                                                            dir="auto"
                                                            value={editDraft}
                                                            onChange={(e) => setEditDraft(e.target.value)}
                                                            rows={3}
                                                            className="w-full px-2 py-1.5 text-sm rounded-lg bg-white/90 dark:bg-black/25 border border-primary-300/70 dark:border-emerald-700 text-gray-900 dark:text-white [unicode-bidi:plaintext]"
                                                        />
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={cancelEdit}
                                                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-white/80 dark:bg-emerald-950/80 border border-gray-200 dark:border-emerald-800"
                                                            >
                                                                <X className="w-3.5 h-3.5" />
                                                                {t('comment_cancel')}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={savingEdit || !editDraft.trim()}
                                                                onClick={saveEdit}
                                                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-primary-600 text-white dark:bg-emerald-700 disabled:opacity-50"
                                                            >
                                                                {savingEdit ? (
                                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                ) : (
                                                                    <Check className="w-3.5 h-3.5" />
                                                                )}
                                                                {t('comment_save')}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p
                                                        dir="auto"
                                                        className={`text-sm whitespace-pre-wrap break-words [unicode-bidi:plaintext] ${
                                                            isMine
                                                                ? 'text-gray-900 dark:text-emerald-50'
                                                                : 'text-gray-700 dark:text-gray-200'
                                                        }`}
                                                    >
                                                        {c.content}
                                                    </p>
                                                )}
                                            </div>

                                            {isMine && c.avatar && (
                                                <img src={c.avatar} alt="Avatar" className="w-8 h-8 rounded-full border border-gray-200 dark:border-[#333] shadow-sm bg-gray-50 flex-shrink-0" />
                                            )}
                                            {isMine && !c.avatar && (
                                                <div className="w-8 h-8 rounded-full bg-primary-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                                                    {String(c.username || '').slice(0,2).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        <form
                            onSubmit={handleSendComment}
                            className="p-4 border-t border-gray-100 dark:border-[#333] flex gap-2 items-end"
                        >
                            <textarea
                                dir="auto"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder={t('comment_placeholder')}
                                rows={2}
                                className="flex-1 px-3 py-2 bg-white dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none [unicode-bidi:plaintext]"
                            />
                            <button
                                type="submit"
                                disabled={sendingComment || !commentText.trim()}
                                className="shrink-0 flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                {sendingComment ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-100 dark:border-[#333] p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-6">
                            {t('ticket_details_title')}
                        </h3>
                        
                        <div className="space-y-6">
                            {isAdmin && (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-gray-500 text-sm">
                                        <AlertTriangle className="w-4 h-4 mr-2" />
                                        {t('priority_label')}
                                    </div>
                                    <span
                                        className={`text-sm font-bold ${
                                            ticket.priority === 'High'
                                                ? 'text-red-600'
                                                : ticket.priority === 'Medium'
                                                  ? 'text-yellow-600'
                                                  : 'text-green-600'
                                        }`}
                                    >
                                        {ticket.priority}
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <div className="flex items-center text-gray-500 text-sm">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    {t('created_label')}
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {new Date(ticket.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            {isAdmin && (
                                <div className="pt-4 border-t border-gray-100 dark:border-[#333]">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-3">{t('system_checks')}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-600 dark:text-gray-400">{t('locked_for_user')}</span>
                                        <span className={`text-xs font-bold ${(ticket.is_locked || ticket.status !== 'Pending') ? 'text-red-600' : 'text-green-600'}`}>
                                            {(ticket.is_locked || ticket.status !== 'Pending') ? 'YES' : 'NO'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title={t('delete_confirm_title')}
                message={t('delete_confirm_msg')}
                confirmText={t('delete_ticket')}
            />
            <ConfirmModal
                isOpen={commentDeleteId != null}
                onClose={() => setCommentDeleteId(null)}
                onConfirm={confirmDeleteComment}
                title={t('comment_delete_title')}
                message={t('comment_delete_msg')}
                confirmText={t('comment_delete')}
            />
        </div>
    );
};

export default TicketDetails;
