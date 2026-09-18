import { X } from 'lucide-react';
import { type HistoryItem } from '../types';
import PronunciationAnalysis from './PronunciationAnalysis';
import ActionableFeedback from './ActionableFeedback';

interface HistoryPopupProps {
  selectedHistoryItem: HistoryItem | null;
  closePopup: () => void;
  playText: (text: string) => void;
}

export default function HistoryPopup({ selectedHistoryItem, closePopup, playText }: HistoryPopupProps) {
  if (!selectedHistoryItem) return null;

  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-950/80 backdrop-blur-sm z-50 flex justify-end animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-slate-50 dark:bg-slate-900 border-l border-slate-300 dark:border-slate-700/50 shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/80 sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-100">Chi tiết bài đọc</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{selectedHistoryItem.date}</p>
          </div>
          <button 
            onClick={closePopup}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {/* Score section */}
          <div className="flex items-center justify-between mb-8 bg-slate-100 dark:bg-slate-800/30 p-6 rounded-3xl border border-slate-300 dark:border-slate-700/50 shadow-sm">
            <div>
              <p className="text-slate-600 dark:text-slate-400 mb-2 font-medium tracking-wide">Điểm tổng:</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-6xl font-black drop-shadow-md ${selectedHistoryItem.score >= 80 ? 'text-emerald-400' : selectedHistoryItem.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {Math.round(selectedHistoryItem.score)}
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-xl font-bold">/ 100</span>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider mb-1 font-semibold">Phát âm</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{Math.round(selectedHistoryItem.phoneme)}</p>
              </div>
              <div className="text-center">
                <p className="text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider mb-1 font-semibold">Đọc đủ</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{Math.round(selectedHistoryItem.completeness)}</p>
              </div>
              <div className="text-center">
                <p className="text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider mb-1 font-semibold">Trôi chảy</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{Math.round(selectedHistoryItem.fluency)}</p>
              </div>
            </div>
          </div>

          {selectedHistoryItem.scoreData && selectedHistoryItem.scoreData.status === 'success' ? (
            <div className="space-y-8">
              <PronunciationAnalysis scoreData={selectedHistoryItem.scoreData} />
              <ActionableFeedback scoreData={selectedHistoryItem.scoreData} playText={playText} />
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/20 rounded-3xl border border-slate-300 dark:border-slate-700/30">
              <p>Dữ liệu phân tích chi tiết không có sẵn cho bài đọc này.</p>
              <p className="text-sm mt-2 opacity-75">Chỉ áp dụng cho các bài thu âm mới.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
