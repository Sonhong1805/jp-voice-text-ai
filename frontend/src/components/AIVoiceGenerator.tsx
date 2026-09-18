import React, { useState } from 'react';
import { Users, Music, Ear } from 'lucide-react';
import WaveformPlayer from './WaveformPlayer';

const AI_VOICES = [
  { id: 'ja-JP-NanamiNeural', name: 'Nanami (Nữ phổ thông)', gender: 'Nữ', badge: 'HOT' },
  { id: 'ja-JP-KeitaNeural', name: 'Keita (Nam trầm ấm)', gender: 'Nam', badge: 'HOT' },
  { id: 'ja-JP-AyumiNeural', name: 'Ayumi (Nữ trong trẻo)', gender: 'Nữ' },
  { id: 'ja-JP-DaichiNeural', name: 'Daichi (Nam mạnh mẽ)', gender: 'Nam' },
  { id: 'ja-JP-ShioriNeural', name: 'Shiori (Nữ trưởng thành)', gender: 'Nữ' },
  { id: 'ja-JP-NaokiNeural', name: 'Naoki (Nam chuyên nghiệp)', gender: 'Nam' },
  { id: 'ja-JP-MayuNeural', name: 'Mayu (Nữ nhẹ nhàng)', gender: 'Nữ' },
];

interface AIVoiceGeneratorProps {
  text: string;
  startCollapsed?: boolean;
}

export default function AIVoiceGenerator({ text, startCollapsed = false }: AIVoiceGeneratorProps) {
  const [isCollapsed, setIsCollapsed] = useState(startCollapsed);
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);
  const [isGeneratingTts, setIsGeneratingTts] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('ja-JP-NanamiNeural');

  const handleGenerateTts = async () => {
    if (!text.trim()) return;
    setIsGeneratingTts(true);
    try {
      const res = await fetch('http://localhost:8000/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: text.trim(), rate: '+0%', voice: selectedVoice })
      });
      if (!res.ok) throw new Error('TTS failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setTtsAudioUrl(url);
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi tạo âm thanh.');
    } finally {
      setIsGeneratingTts(false);
    }
  };

  const downloadMp3Directly = () => {
    if (!ttsAudioUrl) return;
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = ttsAudioUrl;
    a.download = `jp-voice-tts-${Date.now()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };


  if (isCollapsed) {
    return (
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800/50 flex justify-center">
        <button
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 px-5 py-2.5 rounded-xl border border-blue-300 dark:border-blue-800/50 transition-colors shadow-sm"
        >
          <Ear size={18} /> Nghe mẫu (Giọng đọc AI)
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800/50">
      {ttsAudioUrl ? (
        <div className="space-y-4">
          <WaveformPlayer 
            audioUrl={ttsAudioUrl} 
            isDownloading={false}
            onDownloadMp3={downloadMp3Directly}
          />
          <div className="flex justify-end">
            <button
              onClick={() => setTtsAudioUrl(null)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800/50 rounded-xl transition-all"
            >
              <Users size={16} /> Chọn giọng đọc khác
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5 p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Users size={18} className="text-indigo-500" />
            <h4 className="text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-sm">Giọng đọc đang chọn</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {AI_VOICES.map(voice => (
              <div 
                key={voice.id}
                onClick={() => setSelectedVoice(voice.id)}
                className={`relative cursor-pointer flex items-center p-3 rounded-xl border-2 transition-all ${
                  selectedVoice === voice.id 
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' 
                    : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-lg ${
                    voice.gender === 'Nữ' ? 'bg-pink-100' : 'bg-blue-100'
                  }`}>
                    {voice.gender === 'Nữ' ? '👩' : '👨'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold text-sm ${selectedVoice === voice.id ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200'}`}>
                        {voice.name}
                      </span>
                      {voice.badge && (
                        <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase">
                          {voice.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Tiếng Nhật • {voice.gender}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={handleGenerateTts}
              disabled={isGeneratingTts}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-sm shadow-indigo-600/20 disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0"
            >
              {isGeneratingTts ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Đang khởi tạo...</>
              ) : (
                <><Music size={18} /> Tạo Bản Âm Thanh Ngay</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
