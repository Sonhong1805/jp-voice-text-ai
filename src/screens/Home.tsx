import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, Mic, Settings } from 'lucide-react';
import type { ScoreData, HistoryItem } from '../types';

import AudioRecorder from '../components/AudioRecorder';
import ScoreCard from '../components/ScoreCard';
import PronunciationAnalysis from '../components/PronunciationAnalysis';
import ActionableFeedback from '../components/ActionableFeedback';
import AISenseiCoaching from '../components/AISenseiCoaching';
import HistorySidebar from '../components/HistorySidebar';
import HistoryPopup from '../components/HistoryPopup';
import ConfirmDialog from '../components/ConfirmDialog';
import AIVoiceGenerator from '../components/AIVoiceGenerator';

export default function Home({ text }: { text: string }) {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!text) {
      navigate('/set-text');
    }
  }, [text, navigate]);

  
  const [userAudioUrl, setUserAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, id: string | null, title: string, message: string}>({
    isOpen: false,
    id: null,
    title: '',
    message: ''
  });

  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/history');
        if (response.ok) {
          const data = await response.json();
          setHistory(data);
        }
      } catch (err) {
        console.error("Failed to fetch history", err);
      }
    };
    fetchHistory();
    
    
  }, []);

  const playText = (textToPlay: string) => {
    const utterance = new SpeechSynthesisUtterance(textToPlay);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  const playUserAudio = () => {
    if (userAudioUrl) {
      const audio = new Audio(userAudioUrl);
      audio.play();
    }
  };

  const startRecording = async () => {
    try {
      setScoreData(null);
      setIsSaved(false);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setUserAudioUrl(audioUrl);
        sendAudioForScoring(audioBlob);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setScoreData(null);
      setIsSaved(false);
    const audioUrl = URL.createObjectURL(file);
    setUserAudioUrl(audioUrl);
    sendAudioForScoring(file);
  };

  const sendAudioForScoring = async (audioBlob: Blob | File) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('expected_text', text);

      const response = await fetch('/api/score', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      setScoreData(data);
      
      // Auto-save removed. User must manually save.
    } catch (err) {
      console.error('Error scoring audio:', err);
      setScoreData({
        status: 'error',
        message: 'Lỗi kết nối đến máy chủ. Vui lòng đảm bảo Backend AI đang chạy.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

    const saveToHistory = async () => {
    if (!scoreData || scoreData.status !== 'success' || !scoreData.scores || isSaved) return;
    
    try {
      const historyItem = {
        date: new Date().toLocaleString('vi-VN'),
        score: scoreData.score || 0,
        phoneme: scoreData.scores.phoneme,
        completeness: scoreData.scores.completeness,
        fluency: scoreData.scores.fluency,
        source: userAudioUrl?.startsWith('blob:') ? 'record' : 'upload', // approximate source
        scoreData: scoreData
      };
      
      const saveRes = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(historyItem)
      });
      
      if (saveRes.ok) {
        const savedData = await saveRes.json();
        setHistory(prev => [savedData, ...prev]);
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Error saving history:', err);
    }
  };

  const clearHistory = async () => {
    setConfirmDialog({
      isOpen: true,
      id: 'all',
      title: 'Xoá tất cả lịch sử',
      message: 'Bạn có chắc chắn muốn xoá toàn bộ lịch sử luyện tập không? Hành động này không thể hoàn tác.'
    });
  };

  const openHistoryDetail = (item: HistoryItem) => {
    setSelectedHistoryItem(item);
  };

  const confirmDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDialog({
      isOpen: true,
      id: id,
      title: 'Xoá bài đọc',
      message: 'Bạn có chắc chắn muốn xoá bài đọc này khỏi lịch sử không?'
    });
  };

  const handleConfirmDelete = async () => {
    const id = confirmDialog.id;
    if (!id) return;
    
    try {
      let url = '/api/history';
      if (id !== 'all') {
        url += `/${id}`;
      }
      
      const res = await fetch(url, { method: 'DELETE' });
      if (res.ok) {
        if (id === 'all') {
          setHistory([]);
        } else {
          setHistory(prev => prev.filter(h => h.id !== id));
        }
      }
    } catch (err) {
      console.error('Failed to delete history', err);
    } finally {
      setConfirmDialog({...confirmDialog, isOpen: false, id: null});
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B1120] text-slate-800 dark:text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Header gradient bar */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
      
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Mic className="text-slate-900 dark:text-white" size={20} />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 tracking-tight">
              JP Voice AI
            </h1>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/set-text')}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-all border border-slate-300 dark:border-slate-700/50 shadow-sm"
            >
              <Settings size={18} /> Cấu hình
            </button>
            <button 
              onClick={() => setShowHelp(true)}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-blue-400 hover:bg-blue-900/20 rounded-xl transition-all"
              title="Hướng dẫn"
            >
              <HelpCircle size={20} />
            </button>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-slate-100 dark:bg-slate-800/40 rounded-3xl p-8 border border-slate-300 dark:border-slate-700/50 shadow-xl backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Câu yêu cầu</h3>
                </div>
                
                <p className="text-4xl md:text-5xl font-medium mb-10 tracking-wide text-slate-900 dark:text-slate-100 leading-tight">
                  {text}
                </p>

                  <AIVoiceGenerator text={text} startCollapsed={true} />

                <AudioRecorder 
                  isRecording={isRecording}
                  isProcessing={isProcessing}
                  scoreData={scoreData}
                  userAudioUrl={userAudioUrl}
                  isSaved={isSaved}
                  startRecording={startRecording}
                  stopRecording={stopRecording}
                  resetScoreData={() => { setScoreData(null); setIsSaved(false); }}
                  playUserAudio={playUserAudio}
                  handleFileUpload={handleFileUpload}
                  saveToHistory={saveToHistory}
                />
                
                <ScoreCard scoreData={scoreData!} />
                
                {scoreData?.status === 'success' && scoreData.alignment && (
                  <div className="mt-8 pt-8 border-t border-slate-300 dark:border-slate-700/50 animate-in slide-in-from-bottom-4 duration-500 delay-100">
                    <PronunciationAnalysis scoreData={scoreData} />
                    <ActionableFeedback scoreData={scoreData} playText={playText} />
                    <AISenseiCoaching scoreData={scoreData} expectedText={text} />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <HistorySidebar 
              history={history}
              clearHistory={clearHistory}
              openHistoryDetail={openHistoryDetail}
              confirmDelete={confirmDelete}
            />
          </div>
        </div>
      </div>

      <HistoryPopup 
        selectedHistoryItem={selectedHistoryItem}
        closePopup={() => setSelectedHistoryItem(null)}
        playText={playText}
      />

      <ConfirmDialog 
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDialog({...confirmDialog, isOpen: false, id: null})}
      />

      {showHelp && (
        <div className="fixed inset-0 bg-white dark:bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/50 rounded-3xl max-w-2xl w-full shadow-2xl relative animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-slate-100 mb-6 flex items-center gap-2 shrink-0">
                  <HelpCircle className="text-blue-400" /> Hướng dẫn sử dụng
                </h2>
                
                <div className="space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed overflow-y-auto max-h-[60vh] pr-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}>
                <section>
                  <h3 className="text-lg font-semibold text-blue-300 mb-2 border-b border-slate-200 dark:border-slate-800 pb-2">1. Màu sắc đánh giá</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3"><span className="text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded font-medium border border-emerald-800/50">Xanh lá</span> Phát âm tốt, rõ ràng.</li>
                    <li className="flex items-center gap-3"><span className="text-yellow-400 bg-yellow-900/30 px-2 py-1 rounded font-medium border border-yellow-800/50">Vàng (🟡)</span> Phát âm sai nhẹ, cần rõ hơn.</li>
                    <li className="flex items-center gap-3"><span className="text-red-400 bg-red-900/30 px-2 py-1 rounded font-medium border border-red-800/50">Đỏ (🔴)</span> Phát âm sai hoàn toàn.</li>
                    <li className="flex items-center gap-3"><span className="text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 px-2 py-1 rounded font-medium border border-slate-300 dark:border-slate-700 border-dashed">Nét đứt xám (⚪)</span> Chưa đọc, đọc thiếu, hoặc đọc không khớp nội dung.</li>
                  </ul>
                </section>
                
                <section>
                  <h3 className="text-lg font-semibold text-indigo-300 mb-2 border-b border-slate-200 dark:border-slate-800 pb-2">2. Điểm số</h3>
                  <ul className="space-y-2 list-disc list-inside">
                    <li><strong className="text-slate-800 dark:text-slate-200">Phát âm:</strong> Độ chính xác của từng âm vị.</li>
                    <li><strong className="text-slate-800 dark:text-slate-200">Đọc đủ:</strong> Tỷ lệ các từ bạn đã đọc so với câu gốc.</li>
                    <li><strong className="text-slate-800 dark:text-slate-200">Trôi chảy:</strong> Tốc độ và nhịp điệu (ngắt nghỉ).</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-pink-300 mb-2 border-b border-slate-200 dark:border-slate-800 pb-2">3. Quy định file âm thanh</h3>
                  <ul className="space-y-2 list-disc list-inside">
                    <li><strong className="text-slate-800 dark:text-slate-200">Định dạng hợp lệ:</strong> .wav, .mp3, .m4a, .ogg, .flac</li>
                    <li><strong className="text-slate-800 dark:text-slate-200">Dung lượng tối đa:</strong> 50 MB</li>
                    <li><strong className="text-slate-800 dark:text-slate-200">Độ dài tối đa:</strong> 60 giây</li>
                  </ul>
                </section>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-900/50 rounded-b-3xl">
              <button 
                onClick={() => setShowHelp(false)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/20"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
