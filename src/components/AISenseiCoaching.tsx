import { useState } from 'react';
import { Sparkles, MessageCircle, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { type ScoreData } from '../types';

interface AISenseiCoachingProps {
  scoreData: ScoreData;
  expectedText: string;
}

export default function AISenseiCoaching({ scoreData, expectedText }: AISenseiCoachingProps) {
  const [coaching, setCoaching] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasErrors = scoreData.errors && scoreData.errors.length > 0;
  if (!hasErrors) return null;

  const handleAskSensei = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/coaching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expected_text: expectedText,
          transcription: scoreData.transcription || '',
          errors: scoreData.errors
        })
      });
      
      const data = await res.json();
      if (data.status === 'success') {
        setCoaching(data.markdown);
      } else if (data.message === 'API_KEY_MISSING') {
        setError('Chưa cấu hình GEMINI_API_KEY trong file .env. Vui lòng thêm key và khởi động lại server.');
      } else {
        setError(data.message || 'Có lỗi xảy ra khi gọi AI Sensei.');
      }
    } catch (err) {
      setError('Không thể kết nối đến máy chủ.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-900/50 shadow-sm animate-in fade-in duration-500">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mb-2 flex items-center gap-2">
            <Sparkles size={20} className="text-yellow-500" /> AI Sensei Coaching
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Nhận lời khuyên chi tiết về cách uốn lưỡi, đặt khẩu hình miệng để sửa các lỗi phát âm bên trên.
          </p>
        </div>
        
        {!coaching && !isLoading && (
          <button 
            onClick={handleAskSensei}
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all shadow-md shadow-indigo-600/20 hover:-translate-y-0.5"
          >
            <MessageCircle size={18} /> Hỏi Sensei
          </button>
        )}
      </div>

      {isLoading && (
        <div className="p-8 flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-indigo-600 dark:text-indigo-400 font-medium animate-pulse">Sensei đang phân tích lỗi sai của bạn...</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-start gap-3 border border-red-100 dark:border-red-800/30">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {coaching && (
        <div className="mt-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-indigo-100 dark:border-indigo-800/30 shadow-inner">
          <div className="prose prose-indigo dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:text-slate-700 dark:prose-p:text-slate-300">
            <ReactMarkdown>{coaching}</ReactMarkdown>
          </div>
          <div className="mt-6 flex justify-end">
             <button 
              onClick={handleAskSensei}
              className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1"
            >
              <Sparkles size={14} /> Xin lời khuyên khác
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
