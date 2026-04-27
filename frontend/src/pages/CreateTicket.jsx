import { useState } from 'react';
import { Upload, Mic, MicOff, Send, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateTicket = () => {
    const navigate = useNavigate();
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mock submit
        navigate('/');
    };

    const toggleRecording = () => {
        if (isRecording) {
            setIsRecording(false);
            setRecordingTime(0);
        } else {
            setIsRecording(true);
            setRecordingTime(0);
            // mock recording timer
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Submit New Ticket</h1>
                <p className="text-gray-500">Please provide as much detail as possible to help us resolve your issue quickly.</p>
            </div>

            <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-gray-100 dark:border-[#333] overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Issue Title</label>
                            <input 
                                type="text" 
                                placeholder="E.g. Printer on 3rd floor is out of ink"
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:text-white transition-all" 
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Issue Type</label>
                            <select className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:text-white transition-all">
                                <option>IT Hardware</option>
                                <option>Software / System</option>
                                <option>Network</option>
                                <option>Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone Number (Optional)</label>
                            <input 
                                type="tel" 
                                placeholder="Ext. or Mobile"
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:text-white transition-all" 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Floor</label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:text-white transition-all" 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Department</label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:text-white transition-all" 
                            />
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Detailed Description</label>
                            <textarea 
                                rows="4"
                                placeholder="Describe the issue in detail..."
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:text-white transition-all resize-none" 
                                required
                            ></textarea>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-[#333]">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Attachments & Media</label>
                        <div className="flex flex-wrap gap-4">
                            
                            {/* Image Upload Button */}
                            <button type="button" className="flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#333] rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors border border-dashed border-gray-300 dark:border-gray-600">
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Image
                            </button>

                            {/* Voice Record Button */}
                            <button 
                                type="button" 
                                onClick={toggleRecording}
                                className={`flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${isRecording ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-900 dark:text-red-400' : 'bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#333] text-gray-700 dark:text-gray-300 border-dashed border-gray-300 dark:border-gray-600'}`}
                            >
                                {isRecording ? (
                                    <>
                                        <MicOff className="w-4 h-4 mr-2 animate-pulse" />
                                        Stop Recording (0:{recordingTime.toString().padStart(2, '0')}/30)
                                    </>
                                ) : (
                                    <>
                                        <Mic className="w-4 h-4 mr-2" />
                                        Record Voice (Max 30s)
                                    </>
                                )}
                            </button>

                        </div>
                        <p className="text-xs text-gray-500 mt-2">You can attach screenshots or a short voice clip to help explain the issue.</p>
                    </div>

                    <div className="pt-6 flex justify-end gap-3">
                        <button type="button" onClick={() => navigate('/')} className="px-5 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#333] font-medium transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium shadow-lg shadow-primary-500/30 transition-all flex items-center">
                            Submit Ticket
                            <Send className="w-4 h-4 ml-2" />
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default CreateTicket;
