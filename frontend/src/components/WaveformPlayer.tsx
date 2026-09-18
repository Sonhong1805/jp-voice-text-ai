import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause, Download, Music } from 'lucide-react';
import { audioBufferToWav } from '../utils/audioUtils';

interface WaveformPlayerProps {
  audioUrl: string;
  isDownloading: boolean;
  onDownloadMp3: () => void;
}

export default function WaveformPlayer({ audioUrl, isDownloading, onDownloadMp3 }: WaveformPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState('00:00');
  const [duration, setDuration] = useState('00:00');
  const [isConverting, setIsConverting] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.setPlaybackRate(playbackSpeed);
    }
  }, [playbackSpeed]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#94a3b8',
      progressColor: '#6366f1',
      cursorColor: 'transparent',
      barWidth: 3,
      barGap: 2,
      barRadius: 3,
      height: 60,
      normalize: true,
    });

    wavesurferRef.current = wavesurfer;

    wavesurfer.load(audioUrl);

    wavesurfer.on('ready', () => {
      setDuration(formatTime(wavesurfer.getDuration()));
    });

    wavesurfer.on('audioprocess', () => {
      setCurrentTime(formatTime(wavesurfer.getCurrentTime()));
    });

    wavesurfer.on('seek', () => {
      setCurrentTime(formatTime(wavesurfer.getCurrentTime()));
    });

    wavesurfer.on('play', () => setIsPlaying(true));
    wavesurfer.on('pause', () => setIsPlaying(false));
    wavesurfer.on('finish', () => setIsPlaying(false));

    return () => {
      wavesurfer.destroy();
    };
  }, [audioUrl]);

  const togglePlay = () => {
    wavesurferRef.current?.playPause();
  };

  const handleDownloadWav = async () => {
    try {
      setIsConverting(true);
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const wavBlob = audioBufferToWav(audioBuffer);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'jp_voice_sample.wav';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("WAV conversion failed", error);
      alert("Không thể chuyển đổi sang WAV");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white">
            <Music size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 leading-tight">Bản Âm Thanh Hoàn Chỉnh</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Đã ghép nối tự động bằng AI • 100% trong trình duyệt</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-medium border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Sẵn sàng
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-4 border border-slate-100 dark:border-slate-700/50">
        <div ref={containerRef} className="w-full"></div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            className="w-12 h-12 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-colors shadow-lg shadow-indigo-600/30"
          >
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
          </button>
          <div>
            <div className="font-mono font-medium text-sm text-slate-700 dark:text-slate-300">
              {currentTime} / {duration}
            </div>
            <div className="text-xs text-slate-500">Bấm Play để nghe lại</div>
          </div>
          
          <div className="hidden sm:flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 ml-4">
            {[0.75, 1.0, 1.25].map(speed => (
              <label key={speed} className="flex items-center gap-1.5 cursor-pointer">
                <input 
                  type="radio" 
                  name="speed" 
                  checked={playbackSpeed === speed} 
                  onChange={() => setPlaybackSpeed(speed)} 
                  className="accent-indigo-500 scale-110"
                />
                <span className={playbackSpeed === speed ? "text-slate-800 dark:text-slate-200 font-medium text-xs" : "text-slate-600 dark:text-slate-400 text-xs"}>{speed}x</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onDownloadMp3}
            disabled={isDownloading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            <Download size={16} /> {isDownloading ? 'Đang tải...' : 'TẢI MP3'}
          </button>
          <button
            onClick={handleDownloadWav}
            disabled={isConverting}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50 border border-slate-200 dark:border-slate-700"
          >
            <Download size={16} /> {isConverting ? 'Đang xử lý...' : 'TẢI WAV'}
          </button>
        </div>
      </div>
    </div>
  );
}
