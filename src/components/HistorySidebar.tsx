import { Upload, Mic, Trash2 } from 'lucide-react';
import { type HistoryItem } from '../types';

interface HistorySidebarProps {
  history: HistoryItem[];
  clearHistory: () => void;
  openHistoryDetail: (h: HistoryItem) => void;
  confirmDelete: (id: string, e: React.MouseEvent) => void;
}

export default function HistorySidebar({ history, clearHistory, openHistoryDetail, confirmDelete }: HistorySidebarProps) {
  return (
    <div className="bg-slate-100 dark:bg-slate-800/40 rounded-3xl p-6 border border-slate-300 dark:border-slate-700/50 shadow-xl backdrop-blur-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 tracking-wide">Lịch sử luyện tập</h3>
        {history.length > 0 && (
          <button 
            onClick={clearHistory}
            className="text-xs font-semibold text-red-400 hover:text-red-300 px-3 py-1.5 bg-red-900/20 hover:bg-red-900/40 rounded-lg transition-colors border border-red-900/30"
          >
            Xoá tất cả
          </button>
        )}
      </div>
      
      {history.length === 0 ? (
        <div className="text-slate-500 dark:text-slate-400 text-sm italic text-center py-8 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-800/50">
          Chưa có dữ liệu. Hãy thu âm thử nhé!
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {history.map((h, i) => (
            <div 
              key={i} 
              className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-300 dark:border-slate-700/50 flex flex-col hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:border-blue-500/30 transition-all cursor-pointer group shadow-sm hover:shadow-md"
              onClick={() => openHistoryDetail(h)}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl shadow-inner ${h.score >= 80 ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/30' : h.score >= 50 ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-800/30' : 'bg-red-900/30 text-red-400 border border-red-800/30'}`}>
                    {Math.round(h.score)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {h.source === 'upload' ? (
                        <span title="Tải lên" className="bg-blue-900/30 p-1.5 rounded-lg border border-blue-800/30"><Upload size={14} className="text-blue-400" /></span>
                      ) : (
                        <span title="Thu âm trực tiếp" className="bg-emerald-900/30 p-1.5 rounded-lg border border-emerald-800/30"><Mic size={14} className="text-emerald-400" /></span>
                      )}
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{h.date}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={(e) => confirmDelete(h.id, e)}
                  className="text-slate-500 dark:text-slate-400 hover:text-red-400 p-2 rounded-lg hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
                  title="Xoá"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg py-1.5 border border-slate-300 dark:border-slate-700/30">
                  <span className="text-slate-600 dark:text-slate-400 block mb-0.5">P.Âm</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{Math.round(h.phoneme)}</span>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg py-1.5 border border-slate-300 dark:border-slate-700/30">
                  <span className="text-slate-600 dark:text-slate-400 block mb-0.5">Đủ</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{Math.round(h.completeness)}</span>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg py-1.5 border border-slate-300 dark:border-slate-700/30">
                  <span className="text-slate-600 dark:text-slate-400 block mb-0.5">T.Chảy</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{Math.round(h.fluency)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
