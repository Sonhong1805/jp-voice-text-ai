import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Plus, ArrowUp, ArrowDown, Copy, Trash2, Wand2, Loader2 } from 'lucide-react';
import { AI_VOICES } from '../constants/voices';
import { concatenateAudioBlobs } from '../utils/audioConcat';
import WaveformPlayer from '../components/WaveformPlayer';

interface DialogTurn {
  id: string;
  voiceId: string;
  text: string;
  delayMs: number;
}

export default function ConversationScript() {
  const navigate = useNavigate();
  const [turns, setTurns] = useState<DialogTurn[]>([
    { id: '1', voiceId: 'vi-VN-HoaiMyNeural', text: '', delayMs: 300 }
  ]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [finalAudioUrl, setFinalAudioUrl] = useState<string | null>(null);

  const addTurn = (index?: number) => {
    const newTurn: DialogTurn = {
      id: Math.random().toString(36).substr(2, 9),
      voiceId: 'vi-VN-HoaiMyNeural',
      text: '',
      delayMs: 300
    };
    
    if (index !== undefined) {
      const newTurns = [...turns];
      newTurns.splice(index + 1, 0, newTurn);
      setTurns(newTurns);
    } else {
      setTurns([...turns, newTurn]);
    }
  };

  const updateTurn = (id: string, field: keyof DialogTurn, value: any) => {
    setTurns(turns.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const moveTurn = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === turns.length - 1) return;
    
    const newTurns = [...turns];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newTurns[index];
    newTurns[index] = newTurns[swapIndex];
    newTurns[swapIndex] = temp;
    setTurns(newTurns);
  };

  const deleteTurn = (id: string) => {
    if (turns.length <= 1) return;
    setTurns(turns.filter(t => t.id !== id));
  };

  const duplicateTurn = (index: number) => {
    const original = turns[index];
    const newTurn: DialogTurn = {
      ...original,
      id: Math.random().toString(36).substr(2, 9)
    };
    const newTurns = [...turns];
    newTurns.splice(index + 1, 0, newTurn);
    setTurns(newTurns);
  };

  const handleGenerate = async () => {
    const validTurns = turns.filter(t => t.text.trim().length > 0);
    if (validTurns.length === 0) return;

    setIsGenerating(true);
    setProgress(0);
    setFinalAudioUrl(null);

    try {
      const audioSegments: { blob: Blob; delayMs: number }[] = [];
      
      for (let i = 0; i < validTurns.length; i++) {
        const turn = validTurns[i];
        setProgress(Math.round(((i) / validTurns.length) * 100));
        
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: turn.text.trim(),
            voice: turn.voiceId,
            speed: 1.0
          })
        });
        
        if (!res.ok) throw new Error(`API error for turn ${i+1}`);
        const blob = await res.blob();
        
        // Use the specified delay, except for the last turn which gets 0
        const isLast = i === validTurns.length - 1;
        audioSegments.push({ 
          blob, 
          delayMs: isLast ? 0 : turn.delayMs 
        });
      }
      
      setProgress(95); // Decoding and Concatenating...
      const combinedBlob = await concatenateAudioBlobs(audioSegments);
      
      const url = URL.createObjectURL(combinedBlob);
      setFinalAudioUrl(url);
      setProgress(100);
      
      // Scroll to bottom
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
      
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra khi tạo giọng đọc!');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const totalChars = turns.reduce((acc, curr) => acc + curr.text.length, 0);

  return (
    <div className="max-w-4xl mx-auto p-4 animate-in fade-in duration-500 pb-32">
      <div className="flex items-center justify-between mb-8 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/')}
              className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              title="Quay lại"
            >
              ← Quay lại
            </button>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <MessageSquare className="text-indigo-500" />
              Kịch Bản Hội Thoại Đa Nhân Vật
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 ml-14">
            {turns.length} lượt thoại • Tổng {totalChars} ký tự
          </p>
        </div>
        <button
          onClick={() => addTurn()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-800/50 transition-colors font-medium text-sm border border-indigo-100 dark:border-indigo-800"
        >
          <Plus size={16} /> Thêm Lượt Thoại
        </button>
      </div>

      <div className="space-y-6">
        {turns.map((turn, index) => (
          <div key={turn.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden group">
            {/* Header Toolbar */}
            <div className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-bold rounded-lg text-sm">
                  #{index + 1}
                </span>
                <select
                  value={turn.voiceId}
                  onChange={(e) => updateTurn(turn.id, 'voiceId', e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block px-3 py-1.5 font-medium min-w-[250px]"
                >
                  {AI_VOICES.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.icon} {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                <button onClick={() => moveTurn(index, 'up')} disabled={index === 0} className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-30 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"><ArrowUp size={16} /></button>
                <button onClick={() => moveTurn(index, 'down')} disabled={index === turns.length - 1} className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-30 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"><ArrowDown size={16} /></button>
                <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                <button onClick={() => duplicateTurn(index)} className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"><Copy size={16} /></button>
                <button onClick={() => deleteTurn(turn.id)} disabled={turns.length <= 1} className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-30 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"><Trash2 size={16} /></button>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-4">
              <textarea
                value={turn.text}
                onChange={(e) => updateTurn(turn.id, 'text', e.target.value)}
                placeholder="Nhập nội dung thoại..."
                className="w-full min-h-[100px] bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>

            {/* Footer */}
            <div className="px-4 pb-4 flex justify-between items-center text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span>Độ trễ sau câu:</span>
                <input
                  type="number"
                  value={turn.delayMs}
                  onChange={(e) => updateTurn(turn.id, 'delayMs', parseInt(e.target.value) || 0)}
                  className="w-20 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-center focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-300"
                />
                <span>ms</span>
              </div>
              <div className="font-mono text-xs opacity-70">
                {turn.text.length} ký tự
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={() => addTurn(turns.length - 1)}
          className="flex items-center gap-2 px-6 py-2 border-2 border-dashed border-indigo-200 dark:border-indigo-800/50 text-indigo-600 dark:text-indigo-400 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all font-medium text-sm"
        >
          <Plus size={16} /> Thêm Lượt Thoại Tiếp Theo
        </button>
      </div>

      {/* Generating Button */}
      <div className="mt-12">
        <button
          onClick={handleGenerate}
          disabled={isGenerating || turns.every(t => !t.text.trim())}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-xl font-bold text-lg transition-colors shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:shadow-none"
        >
          {isGenerating ? (
            <>
              <Loader2 size={24} className="animate-spin" />
              Đang xử lý... {progress}%
            </>
          ) : (
            <>
              <Wand2 size={24} />
              TẠO GIỌNG ĐỌC AI NGAY
            </>
          )}
        </button>
      </div>

      {/* Result Player */}
      {finalAudioUrl && (
        <div className="mt-8 animate-in slide-in-from-bottom-4 duration-500">
          <WaveformPlayer 
            audioUrl={finalAudioUrl} 
            isDownloading={false}
            onDownloadMp3={() => {
              // For now, trigger WAV download since we combined it in WAV
              const a = document.createElement('a');
              a.href = finalAudioUrl;
              a.download = 'kich-ban-hoi-thoai.wav';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }}
          />
        </div>
      )}
    </div>
  );
}
