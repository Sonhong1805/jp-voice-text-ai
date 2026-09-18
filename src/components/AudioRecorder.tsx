import { useRef } from 'react';
import { Mic, Square, Play, RotateCcw, Bookmark, Upload } from 'lucide-react';
import { type ScoreData } from '../types';

interface AudioRecorderProps {
  isRecording: boolean;
  isProcessing: boolean;
  scoreData: ScoreData | null;
  userAudioUrl: string | null;
  isSaved: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  resetScoreData: () => void;
  playUserAudio: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  saveToHistory: () => void;
}

export default function AudioRecorder({
  isRecording,
  isProcessing,
  scoreData,
  userAudioUrl,
  isSaved,
  startRecording,
  stopRecording,
  resetScoreData,
  playUserAudio,
  handleFileUpload,
  saveToHistory
}: AudioRecorderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (scoreData?.status === 'error') {
    return (
      <div className="flex justify-between items-start mb-6">
        <div className="p-4 rounded-xl border flex-1 mr-4 bg-red-900/20 border-red-900/50 text-red-300">
          <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
            🔴 Lỗi âm thanh
          </h3>
          <p>{scoreData.message || 'Không phát hiện giọng nói hoặc file âm thanh không hợp lệ. Vui lòng thử lại với âm thanh rõ ràng hơn.'}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={resetScoreData} className="p-3 bg-slate-700 hover:bg-slate-600 rounded-full transition-colors" title="Thử lại">
            <RotateCcw size={20} />
          </button>
        </div>
      </div>
    );
  }

  if (scoreData?.status === 'success') {
    return (
      <div className="flex justify-center mt-6 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {userAudioUrl && (
            <button onClick={playUserAudio} className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl transition-all shadow-md border border-slate-300 dark:border-slate-700/50">
              <Play size={18} className="text-blue-400" /> Nghe lại
            </button>
          )}
          <button onClick={resetScoreData} className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl transition-all shadow-md border border-slate-300 dark:border-slate-700/50">
            <RotateCcw size={18} /> Thử lại
          </button>
          <button 
            onClick={saveToHistory}
            disabled={isSaved} 
            className={`flex items-center gap-2 px-5 py-2.5 text-white rounded-xl transition-all shadow-md ${isSaved ? 'bg-emerald-600/80 cursor-default shadow-emerald-500/20' : 'bg-blue-600/90 hover:bg-blue-500 shadow-blue-500/20'}`}
          >
            <Bookmark size={18} /> {isSaved ? 'Đã lưu' : 'Lưu kết quả'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-center my-8">
        {isRecording ? (
          <button 
            onClick={stopRecording}
            className="px-8 py-4 bg-red-500 hover:bg-red-400 text-white rounded-full font-bold flex items-center gap-3 animate-pulse shadow-[0_0_25px_rgba(239,68,68,0.5)] transition-all scale-105"
          >
            <Square size={20} fill="currentColor" /> Dừng thu âm
          </button>
        ) : (
          <button 
            onClick={startRecording}
            disabled={isProcessing}
            className={`px-8 py-4 rounded-full font-bold flex items-center gap-3 transition-all ${isProcessing ? 'bg-slate-700/80 text-slate-600 dark:text-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]'}`}
          >
            <Mic size={22} className={isProcessing ? 'opacity-50' : ''} />
            {isProcessing ? 'Đang chấm điểm...' : 'Bắt đầu thu âm'}
          </button>
        )}
      </div>
      
      {!isRecording && !isProcessing && (
        <div className="w-full max-w-sm mt-6 flex flex-col items-center gap-5 animate-in fade-in duration-500 mx-auto">
          <div className="flex items-center gap-4 w-full opacity-60">
            <div className="h-px bg-slate-700 flex-1"></div>
            <span className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-widest font-semibold">Hoặc tải lên</span>
            <div className="h-px bg-slate-700 flex-1"></div>
          </div>
          
          <input 
            type="file" 
            accept="audio/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex justify-center items-center gap-2 w-full py-3 px-4 bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-300 dark:hover:bg-slate-700 border border-slate-600/50 hover:border-slate-500 rounded-xl text-slate-700 dark:text-slate-300 font-medium transition-all shadow-sm"
          >
            <Upload size={18} /> Chọn file âm thanh
          </button>
        </div>
      )}
    </>
  );
}
