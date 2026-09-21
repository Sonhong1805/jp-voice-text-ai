import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Search, AlertCircle, CheckCircle2, History, Upload } from 'lucide-react';
import TranslatorWidget from '../components/TranslatorWidget';
import AIVoiceGenerator from '../components/AIVoiceGenerator';
import type { ExpectedChunk, SavedSentence } from '../types';

interface SetTextProps {
  initialText: string;
  onSave: (text: string) => void;
}


export default function SetText({ initialText, onSave }: SetTextProps) {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState(initialText);
  const [showPhonemes, _setShowPhonemes] = useState(false);
  const [textError, setTextError] = useState('');
  const [textWarning, setTextWarning] = useState('');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [analyzedChunks, setAnalyzedChunks] = useState<ExpectedChunk[]>([]);
  
  const [savedSentences, setSavedSentences] = useState<SavedSentence[]>([]);



  


  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [transcriptionError, setTranscriptionError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsTranscribing(true);
    setTranscriptionError('');
    setTranscription('');
    
    const formData = new FormData();
    formData.append('audio', file);
    
    try {
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setTranscription(data.transcription);
        setInputText(data.transcription);
        setTextError('');
        setAnalysisStatus('idle');
        setAnalyzedChunks([]);
      } else {
          let errMsg = data.message || "Lỗi nhận diện âm thanh.";
        if (data.error_type === 'audio_invalid') {
            errMsg = `Âm thanh không hợp lệ: ${errMsg}`;
        } else if (data.error_type === 'asr_unrecognized') {
            errMsg = "Không nhận diện được giọng nói trong âm thanh này.";
        }
        setTranscriptionError(errMsg);
      }
    } catch (err) {
        setTranscriptionError("Lỗi kết nối đến máy chủ.");
    } finally {
      setIsTranscribing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };


  useEffect(() => {
    const saved = localStorage.getItem('saved_sentences');
    if (saved) {
      try {
        setSavedSentences(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputText(val);
    setTextError('');
    setAnalysisStatus('idle');
    setAnalyzedChunks([]);
    
    if (val.length > 50 && val.length <= 150) {
      setTextWarning(`Câu khá dài (${val.length} ký tự). Bạn nên chia thành 2-3 câu để luyện phát âm dễ hơn.`);
    } else {
      setTextWarning('');
    }
  };

  const handleAnalyze = async () => {
    const text = inputText.trim();
    if (!text) {
      setTextError('Vui lòng nhập câu tiếng Nhật');
      return;
    }
    if (text.length > 150) {
      setTextError('Câu quá dài (tối đa 150 ký tự)');
      return;
    }
    
    // Check for at least one Japanese character (Hiragana, Katakana, Kanji)
    const hasJapanese = /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(text);
    if (!hasJapanese) {
      setTextError('Câu luyện tập không chứa tiếng Nhật. Vui lòng nhập Hiragana, Katakana hoặc Kanji.');
      return;
    }

    setTextError('');
    setIsAnalyzing(true);
    setAnalysisStatus('idle');

    try {
      const res = await fetch('/api/analyze-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setAnalyzedChunks(data.chunks);
        setAnalysisStatus('success');
      } else {
        setTextError(data.detail || data.message || 'Không thể phân tích câu này. Vui lòng kiểm tra lại nội dung.');
        setAnalysisStatus('error');
      }
    } catch (err) {
      setTextError('Lỗi kết nối đến máy chủ.');
      setAnalysisStatus('error');
    } finally {
      setIsAnalyzing(false);
    }
  };


  const handleSaveText = () => {
    const text = inputText.trim();
    if (!text || textError) return;
    
    // Quick validation before saving
    const hasJapanese = /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(text);
    if (!hasJapanese) {
      setTextError('Câu luyện tập không chứa tiếng Nhật. Vui lòng nhập Hiragana, Katakana hoặc Kanji.');
      return;
    }
    
    
    // Save to local storage
    const newSaved = [...savedSentences];
    // Don't save duplicates
    if (!newSaved.find(s => s.text === text)) {
      newSaved.unshift({
        id: Date.now().toString(),
        text: text,
        createdAt: new Date().toISOString()
      });
      
      // Keep only last 50 sentences
      const trimmed = newSaved.slice(0, 50);
      setSavedSentences(trimmed);
      localStorage.setItem('saved_sentences', JSON.stringify(trimmed));
    }

    onSave(text);
    navigate('/');
  };
  

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 p-8 flex justify-center pb-20">
      <div className="w-full max-w-3xl mt-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            Cài đặt câu luyện tập
          </h1>
          <button 
            onClick={() => navigate('/')}
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden mb-6">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500/50 to-emerald-500/50"></div>
          
          
          <div className="flex justify-between items-end mb-2">
            <div className="flex items-center gap-4">
              <label className="block text-slate-600 dark:text-slate-400 font-medium">Nhập câu tiếng Nhật</label>
              <div className="flex items-center gap-2">
                <input 
                  type="file" 
                  accept="audio/*" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleAudioUpload} 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isTranscribing}
                  className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 rounded-md text-xs font-medium transition-colors border border-indigo-500/30 disabled:opacity-50"
                  title="Upload audio mẫu để tự động chuyển thành text"
                >
                  {isTranscribing ? (
                    <><div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div> Nhận diện...</>
                  ) : (
                    <><Upload size={14} /> Upload Audio (Auto Text)</>
                  )}
                </button>
              </div>
            </div>
            <span className={`text-xs ${inputText.length > 150 ? 'text-red-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>{inputText.length} / 150 kí tự</span>
          </div>
          
          {transcriptionError && (
            <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
              <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-red-400">{transcriptionError}</p>
            </div>
          )}
          
          {transcription && (
            <div className="mb-3 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg animate-in fade-in slide-in-from-top-2">
              <p className="text-xs text-indigo-400 font-medium mb-2 uppercase tracking-wider flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                AI nhận diện được (Kana):
              </p>
              <p className="text-slate-800 dark:text-slate-200 text-lg">{transcription}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 italic border-t border-indigo-500/20 pt-2 leading-relaxed">
                * Kết quả do AI nhận diện định dạng Kana và có thể chưa hoàn toàn chính xác. Bạn có thể tự do chỉnh sửa lại thành Kanji/Hiragana vào ô bên dưới trước khi bấm "Phân tích".
              </p>
            </div>
          )}

          
          <textarea
            value={inputText}
            onChange={handleTextChange}
            className={`w-full bg-white dark:bg-slate-950 border ${textError ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} rounded-lg p-4 text-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 min-h-[120px] resize-y transition-colors mb-2`}
            placeholder="Hãy nhập câu tiếng Nhật..."
          />

          <div className="mb-4">
            <TranslatorWidget 
              onApply={(t) => {
                setInputText(t);
              }}
            />
          </div>

          
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              {textError && (
                <p className="text-red-400 text-sm flex items-center gap-1"><AlertCircle size={14}/> {textError}</p>
              )}
              {textWarning && !textError && (
                <p className="text-yellow-400 text-sm flex items-center gap-1"><AlertCircle size={14}/> {textWarning}</p>
              )}
            </div>
            

            <div className="flex items-center gap-3">
              <button
                onClick={() => setInputText("初めまして。私の趣味は音楽を聞くことです。これからも日本語の勉強を頑張りたいと思います。よろしくお願いします。")}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors"
              >
                Thử văn bản mẫu
              </button>
            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing || !inputText.trim()}
              className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <><div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div> Đang phân tích...</>
              ) : (
                <><Search size={16} /> Phân tích</>
              )}
            </button>
            </div>
          </div>
          
          {/* Analysis Preview Section */}
          {analysisStatus === 'success' && (
            <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-4">
                <p className="text-emerald-400 text-sm font-medium flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-md inline-flex border border-emerald-500/20 mb-4">
                  <CheckCircle2 size={16} /> Phân tích thành công
                </p>

              </div>
              
              <div className="bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 p-6 overflow-x-auto mb-4">
                <div className="flex flex-wrap gap-x-10 gap-y-8 mb-6 mt-4">
                    {analyzedChunks.map((chunk, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <span className="text-4xl text-slate-900 dark:text-white font-medium tracking-wide mb-2 drop-shadow-sm">{chunk.text}</span>
                        <span className="text-lg text-blue-300 font-medium">{chunk.kana}</span>
                        {showPhonemes && (
                          <span className="text-sm text-slate-600 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-md mt-2 tracking-widest shadow-inner border border-slate-300 dark:border-slate-700/50">{chunk.phonemes.join(' ')}</span>
                        )}
                      </div>
                    ))}
                  </div>
                

                <AIVoiceGenerator text={inputText} />
            </div>
              </div>
            )}

          {analysisStatus === 'error' && (
            <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-6">
              <p className="text-red-400 text-sm flex items-center gap-1 bg-red-500/10 px-3 py-1.5 rounded-md inline-flex border border-red-500/20">
                <AlertCircle size={16} /> Lỗi: Không thể phân tích câu này.
              </p>
            </div>
          )}
          
          <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800 pt-6">
            <button 
              onClick={() => {
                setInputText('こんにちは、いい天気ですね。');
                setAnalysisStatus('idle');
                setAnalyzedChunks([]);
              }}
              className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors"
            >
              Hủy
            </button>
            <button 
              onClick={handleSaveText}
              disabled={!inputText.trim() || !!textError || isAnalyzing}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
            >
              <Save size={18} />
              Bắt đầu luyện tập
            </button>
          </div>
        </div>

        {/* Saved Sentences */}
        {savedSentences.length > 0 && (
          <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/50 rounded-xl p-6">
            <h3 className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2 mb-4">
              <History size={18} className="text-slate-500 dark:text-slate-400" /> Các câu đã lưu
            </h3>
            <div className="flex flex-col gap-2">
              {savedSentences.map((sentence) => (
                <div key={sentence.id} className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                  <span className="text-slate-700 dark:text-slate-300 truncate flex-1 pr-4" title={sentence.text}>{sentence.text}</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => { onSave(sentence.text); navigate('/'); }}
                      className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 text-xs font-medium rounded-md transition-colors"
                    >
                      Luyện tập
                    </button>
                    <button 
                      onClick={() => {
                        const newSaved = savedSentences.filter(s => s.id !== sentence.id);
                        setSavedSentences(newSaved);
                        localStorage.setItem('saved_sentences', JSON.stringify(newSaved));
                      }}
                      className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                      title="Xóa"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}

