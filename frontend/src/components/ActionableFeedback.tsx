import { Activity, Ear, Lightbulb } from 'lucide-react';
import { type ScoreData } from '../types';

interface ActionableFeedbackProps {
  scoreData: ScoreData;
  playText: (text: string) => void;
}

export default function ActionableFeedback({ scoreData, playText }: ActionableFeedbackProps) {
  if (!scoreData || scoreData.status !== 'success') return null;

  const hasErrors = scoreData.errors && scoreData.errors.length > 0;
  const isPerfect = !hasErrors && scoreData.score !== undefined && scoreData.score >= 80;

  return (
    <>
      {hasErrors && (
        <div className="mt-8 bg-transparent rounded-2xl p-6 border border-slate-200 dark:border-slate-800/80 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h3 className="text-xl font-bold text-[#ff7b7b] mb-6 flex items-center gap-3">
            <Activity size={22} className="text-[#ff7b7b]" /> Cần cải thiện
          </h3>
          <div className="space-y-4">
            {scoreData.errors!.map((err, i) => (
              <div key={i} className="flex gap-4 bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/60 transition-all hover:bg-slate-100 dark:hover:bg-slate-800/30">
                <div className="mt-0.5 text-2xl filter drop-shadow-sm flex items-center justify-center w-8 h-8">
                  {err.type === 'missing' ? '⚪' : err.severity === 'minor' ? '🟡' : '🔴'}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <p className="font-bold text-slate-900 dark:text-white text-xl flex items-center gap-2">
                      {err.word}
                      {err.token && err.token !== err.word && (
                        <span className="bg-red-900/40 text-red-400 px-2 py-0.5 rounded text-base border border-red-800/50 font-normal">
                          {err.token}
                        </span>
                      )}
                    </p>
                    <span className="text-slate-600 dark:text-slate-400 font-medium">({err.message})</span>
                    <button 
                      onClick={() => playText(err.word)} 
                      className="ml-auto inline-flex items-center gap-2 text-sm font-medium text-[#8ab4f8] bg-[#8ab4f8]/10 hover:bg-[#8ab4f8]/20 px-4 py-1.5 rounded-xl transition-colors border border-[#8ab4f8]/20" 
                      title="Nghe mẫu"
                    >
                      <Ear size={16} /> Nghe mẫu
                    </button>
                  </div>
                  <div className="text-sm text-[#00d28f] bg-[#00d28f]/10 p-4 rounded-xl flex items-start gap-3 border border-[#00d28f]/20">
                    <Lightbulb size={18} className="mt-0.5 shrink-0 text-[#00d28f]" />
                    <p className="leading-relaxed font-medium">{err.fix_suggestion}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isPerfect && (
        <div className="mt-10 text-center bg-emerald-900/20 border border-emerald-800/30 p-6 rounded-2xl shadow-lg backdrop-blur-sm animate-in zoom-in-95 duration-500">
          <p className="text-emerald-400 text-xl font-bold tracking-wide">
            🎉 Tuyệt vời! Bạn phát âm rất tốt câu này.
          </p>
        </div>
      )}
    </>
  );
}
