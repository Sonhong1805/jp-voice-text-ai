import { type ScoreData } from '../types';

interface PronunciationAnalysisProps {
  scoreData: ScoreData;
}

export default function PronunciationAnalysis({ scoreData }: PronunciationAnalysisProps) {
  if (!scoreData || scoreData.status !== 'success' || !scoreData.alignment) return null;

  return (
    <div className="mb-8">
      <p className="text-slate-700 dark:text-slate-300 font-semibold mb-4 tracking-wide text-lg">Phân tích phát âm:</p>
      <div className="inline-flex flex-wrap gap-2 bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-300 dark:border-slate-700/50 shadow-inner backdrop-blur-md">
        {scoreData.alignment.map((chunk, i) => {
          let chunkColorClass = "text-slate-800 dark:text-slate-200";
          let bgClass = "bg-transparent border-slate-300 dark:border-slate-700/50";
          
          if (chunk.color === 'green') {
            chunkColorClass = "text-[#00d28f]"; // match screenshot color
            bgClass = "bg-[#00d28f]/5 border-[#00d28f]/30";
          } else if (chunk.color === 'yellow') {
            chunkColorClass = "text-yellow-400";
            bgClass = "bg-yellow-400/5 border-yellow-400/30";
          } else if (chunk.color === 'red') {
            chunkColorClass = "text-red-400";
            bgClass = "bg-red-400/5 border-red-400/30";
          } else if (chunk.color === 'gray') {
            chunkColorClass = "text-slate-500 dark:text-slate-400 line-through decoration-slate-600";
            bgClass = "bg-transparent border-slate-300 dark:border-slate-700 border-dashed opacity-80";
          }
          
          return (
            <span 
              key={i} 
              className={`text-2xl font-medium tracking-wide px-4 py-2 rounded-xl border transition-all duration-300 cursor-default ${chunkColorClass} ${bgClass}`}
              title={chunk.color === 'gray' ? 'Chưa đọc / Không khớp' : `Phát âm: ${chunk.color === 'green' ? 'Tốt' : chunk.color === 'yellow' ? 'Sai nhẹ' : 'Sai nặng'}`}
            >
              {chunk.text}
            </span>
          );
        })}
      </div>
    </div>
  );
}
