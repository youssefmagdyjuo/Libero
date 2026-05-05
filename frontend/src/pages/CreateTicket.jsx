import { useState, useRef, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Upload, Mic, MicOff, Send, X, Loader2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const CreateTicket = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isAdmin = useMemo(
        () => user?.role === 'SUPER_ADMIN' || user?.role === 'IT_ADMIN',
        [user]
    );
    const [isRecording, setIsRecording] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [selectedImage, setSelectedImage] = useState(null);
    const [recordedAudio, setRecordedAudio] = useState(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const [formData, setFormData] = useState({
        title: '',
        issue_type: 'IT',
        phone: '',
        floor: '',
        department: '',
        description: '',
        ...(isAdmin ? { priority: 'Medium' } : {})
    });

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedImage(e.target.files[0]);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                const audioFile = new File([audioBlob], 'voice-recording.wav', { type: 'audio/wav' });
                setRecordedAudio(audioFile);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            setError('Could not access microphone. Please check permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const data = new FormData();
        Object.keys(formData).forEach((key) => data.append(key, formData[key]));
        if (!isAdmin) data.set('priority', 'Medium');
        if (selectedImage) data.append('image', selectedImage);
        if (recordedAudio) data.append('voice', recordedAudio);

        try {
            await axios.post('http://localhost:5000/api/tickets', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Ticket submitted successfully!');
            navigate('/tickets');
        } catch (err) {
            console.error('Failed to submit ticket:', err);
            const msg = err.response?.data?.message || 'Failed to submit ticket. Please try again.';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <div className="mb-6 text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('submit_ticket')}</h1>
                <p className="text-gray-500 text-sm">{t('ticket_form_hint')}</p>
            </div>

            <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-gray-100 dark:border-[#333] overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('issue_title')}</label>
                            <input 
                                type="text" 
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                placeholder={t('issue_title_placeholder')}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:text-white transition-all" 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('issue_type')}</label>
                            <select 
                                value={formData.issue_type}
                                onChange={(e) => setFormData({...formData, issue_type: e.target.value})}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:text-white transition-all"
                            >
                                <option value="IT">IT</option>
                                <option value="System/PrimeCare">System / PrimeCare</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('phone_optional')}</label>
                            <input 
                                type="tel" 
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                placeholder={t('phone_placeholder')}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:text-white transition-all" 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('floor')}</label>
                            <input 
                                type="text" 
                                value={formData.floor}
                                onChange={(e) => setFormData({...formData, floor: e.target.value})}
                                placeholder={t('floor_placeholder')}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:text-white transition-all" 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('department')}</label>
                            <input 
                                type="text" 
                                value={formData.department}
                                onChange={(e) => setFormData({...formData, department: e.target.value})}
                                placeholder={t('department_placeholder')}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:text-white transition-all" 
                            />
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('detailed_description')}</label>
                            <textarea 
                                rows="4"
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                placeholder={t('description_placeholder')}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:text-white transition-all resize-none" 
                            ></textarea>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-[#333]">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('attachments_media')}</label>
                        <div className="flex flex-wrap gap-4">
                            <div className="relative">
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    id="image-upload"
                                />
                                <label 
                                    htmlFor="image-upload"
                                    className={`flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all border border-dashed ${selectedImage ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-900 dark:text-green-400' : 'bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#333] text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'}`}
                                >
                                    {selectedImage ? <CheckCircle className="w-4 h-4 mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                                    {selectedImage ? t('image_selected') : t('upload_image')}
                                </label>
                                {selectedImage && (
                                    <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 rounded-full shadow-md p-0.5">
                                        <X className="w-3 h-3 text-gray-500" />
                                    </button>
                                )}
                            </div>

                            <div className="relative">
                                <button 
                                    type="button" 
                                    onClick={isRecording ? stopRecording : startRecording}
                                    className={`flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-all border ${isRecording ? 'bg-red-500 border-red-600 text-white animate-pulse' : (recordedAudio ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-900 dark:text-green-400' : 'bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#333] text-gray-700 dark:text-gray-300 border-dashed border-gray-300 dark:border-gray-600')}`}
                                >
                                    {isRecording ? <MicOff className="w-4 h-4 mr-2" /> : (recordedAudio ? <CheckCircle className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />)}
                                    {isRecording ? t('stop_recording') : (recordedAudio ? t('voice_recorded') : t('record_voice'))}
                                </button>
                                {recordedAudio && !isRecording && (
                                    <button onClick={() => setRecordedAudio(null)} className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 rounded-full shadow-md p-0.5">
                                        <X className="w-3 h-3 text-gray-500" />
                                    </button>
                                )}
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">{t('attachments_hint')}</p>
                    </div>

                    <div className="pt-6 flex justify-end gap-3">
                        <button type="button" disabled={loading} onClick={() => navigate('/')} className="px-5 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#333] font-medium transition-colors">
                            {t('cancel')}
                        </button>
                        <button type="submit" disabled={loading} className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium shadow-lg shadow-primary-500/30 transition-all flex items-center justify-center min-w-[140px]">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                <>
                                    {t('submit_ticket')}
                                    <Send className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTicket;
