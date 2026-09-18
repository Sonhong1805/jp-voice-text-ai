import { AlertCircle, FileWarning, EarOff } from 'lucide-react';
import { type ScoreData } from '../types';

interface ScoreCardProps {
  scoreData: ScoreData;
}

export default function ScoreCard({ scoreData }: ScoreCardProps) {
  if (!scoreData) return null;

  if (scoreData.status === 'error') {
    return (
      <div className="mt-8 pt-8 border-t border-slate-300 dark:border-slate-700/50 text-left animate-in slide-in-from-bottom-4 duration-500">
        <div className="bg-red-900/20 border border-red-800/40 p-6 rounded-2xl shadow-lg backdrop-blur-sm">
          <h3 className="text-xl font-bold text-red-400 mb-3 flex items-center gap-2">
            {scoreData.error_type === 'audio_invalid' && <EarOff size={24} />}
            {scoreData.error_type === 'asr_unrecognized' && <EarOff size={24} />}
            {scoreData.error_type === 'possible_content_mismatch' && <FileWarning size={24} />}
            {!['audio_invalid', 'asr_unrecognized', 'possible_content_mismatch'].includes(scoreData.error_type || '') && <AlertCircle size={24} />}
            Có lỗi xảy ra
          </h3>
          <p className="text-red-200/90 text-lg mb-4">
            {scoreData.message || 'Không thể chấm điểm file ghi âm này.'}
          </p>
          
          {scoreData.asr_text && (
            <div className="mt-4 bg-black/30 rounded-xl p-4 border border-red-900/30">
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wider font-semibold">AI đã nghe được gì?</p>
              <p className="text-slate-700 dark:text-slate-300">「{scoreData.asr_text}」</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!scoreData.scores) return null;
  
  const score = scoreData.score ?? 0;
  
  return (
    <div className="mt-8 pt-8 border-t border-slate-300 dark:border-slate-700/50 text-left animate-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <p className="text-slate-600 dark:text-slate-400 mb-2 font-medium tracking-wide">Điểm bài đọc:</p>
        <div className="flex items-baseline gap-2 mb-4">
          <span className={`text-7xl font-black drop-shadow-lg transition-colors ${score >= 80 ? 'text-emerald-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
            {Math.round(score)}
          </span>
          <span className="text-slate-500 dark:text-slate-400 text-2xl font-bold">/ 100</span>
        </div>
        
        {score < 50 && (
          <div className="bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl text-red-400 text-sm inline-block font-medium shadow-sm backdrop-blur-sm">
            Bạn cần cố gắng nhiều hơn ở những từ bị tô màu đỏ!
          </div>
        )}
        {score >= 50 && score < 80 && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 px-4 py-3 rounded-xl text-yellow-400 text-sm inline-block font-medium shadow-sm backdrop-blur-sm">
            Khá tốt, nhưng hãy chú ý sửa một số lỗi phát âm nhỏ.
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-100 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-300 dark:border-slate-700/50 shadow-lg backdrop-blur-sm transition-all hover:bg-slate-100 dark:hover:bg-slate-800/60">
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2 font-medium">Phát âm</p>
          <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">{Math.round(scoreData.scores.phoneme)}</p>
        </div>
        <div className="bg-slate-100 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-300 dark:border-slate-700/50 shadow-lg backdrop-blur-sm transition-all hover:bg-slate-100 dark:hover:bg-slate-800/60">
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2 font-medium">Đọc đủ</p>
          <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">{Math.round(scoreData.scores.completeness)}</p>
        </div>
        <div className="bg-slate-100 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-300 dark:border-slate-700/50 shadow-lg backdrop-blur-sm transition-all hover:bg-slate-100 dark:hover:bg-slate-800/60">
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2 font-medium">Trôi chảy<span className="text-emerald-500 ml-1 text-xs opacity-80">(thử nghiệm)</span></p>
          <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">{Math.round(scoreData.scores.fluency)}</p>
        </div>
      </div>

      {scoreData.asr_text && (
        <details className="mb-4 group">
          <summary className="cursor-pointer text-sm text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 font-medium list-none flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 group-open:rotate-90 transition-transform">▶</span>
            Xem AI đã nghe gì
          </summary>
          <div className="mt-3 bg-black/20 rounded-xl p-4 border border-slate-200 dark:border-slate-800/50 ml-6">
            <p className="text-slate-700 dark:text-slate-300 text-sm">「{scoreData.asr_text}」</p>
          </div>
        </details>
      )}
    </div>
  );
}
