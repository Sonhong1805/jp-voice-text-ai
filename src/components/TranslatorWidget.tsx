import { useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import { Languages, Loader2, ArrowLeftRight, Check, Volume2, Copy } from 'lucide-react';

interface TranslatorWidgetProps {
  initialText?: string;
  onApply: (text: string) => void;
}

const LANGUAGES_OPTIONS = [
  { value: "Phát hiện ngôn ngữ", label: "Phát hiện ngôn ngữ" },
  { value: "Tiếng Việt", label: "Tiếng Việt" },
  { value: "Tiếng Nhật", label: "Tiếng Nhật" },
  { value: "Tiếng Anh", label: "Tiếng Anh" },
  { value: "Tiếng Trung (Giản thể)", label: "Tiếng Trung (Giản thể)" },
  { value: "Tiếng Hàn", label: "Tiếng Hàn" },
  { value: "Tiếng Pháp", label: "Tiếng Pháp" },
  { value: "Tiếng Tây Ban Nha", label: "Tiếng Tây Ban Nha" },
  { value: "Tiếng Nam Phi", label: "Tiếng Nam Phi" },
  { value: "Tiếng Albania", label: "Tiếng Albania" },
  { value: "Tiếng Amhara", label: "Tiếng Amhara" },
  { value: "Tiếng Ả Rập", label: "Tiếng Ả Rập" },
  { value: "Tiếng Armenia", label: "Tiếng Armenia" },
  { value: "Tiếng Azerbaijan", label: "Tiếng Azerbaijan" },
  { value: "Tiếng Basque", label: "Tiếng Basque" },
  { value: "Tiếng Belarus", label: "Tiếng Belarus" },
  { value: "Tiếng Bengal", label: "Tiếng Bengal" },
  { value: "Tiếng Bosnia", label: "Tiếng Bosnia" },
  { value: "Tiếng Bồ Đào Nha", label: "Tiếng Bồ Đào Nha" },
  { value: "Tiếng Bulgaria", label: "Tiếng Bulgaria" },
  { value: "Tiếng Catalunya", label: "Tiếng Catalunya" },
  { value: "Tiếng Cebuano", label: "Tiếng Cebuano" },
  { value: "Tiếng Chichewa", label: "Tiếng Chichewa" },
  { value: "Tiếng Corse", label: "Tiếng Corse" },
  { value: "Tiếng Croatia", label: "Tiếng Croatia" },
  { value: "Tiếng Séc", label: "Tiếng Séc" },
  { value: "Tiếng Đan Mạch", label: "Tiếng Đan Mạch" },
  { value: "Tiếng Đức", label: "Tiếng Đức" },
  { value: "Tiếng Duy Ngô Nhĩ", label: "Tiếng Duy Ngô Nhĩ" },
  { value: "Tiếng Estonia", label: "Tiếng Estonia" },
  { value: "Tiếng Phần Lan", label: "Tiếng Phần Lan" },
  { value: "Tiếng Philippines", label: "Tiếng Philippines" },
  { value: "Tiếng Frisia", label: "Tiếng Frisia" },
  { value: "Tiếng Gael Scotland", label: "Tiếng Gael Scotland" },
  { value: "Tiếng Galicia", label: "Tiếng Galicia" },
  { value: "Tiếng Gruzia", label: "Tiếng Gruzia" },
  { value: "Tiếng Gujarati", label: "Tiếng Gujarati" },
  { value: "Tiếng Hà Lan", label: "Tiếng Hà Lan" },
  { value: "Tiếng Haiti", label: "Tiếng Haiti" },
  { value: "Tiếng Hausa", label: "Tiếng Hausa" },
  { value: "Tiếng Hawaii", label: "Tiếng Hawaii" },
  { value: "Tiếng Hindi", label: "Tiếng Hindi" },
  { value: "Tiếng H'Mông", label: "Tiếng H'Mông" },
  { value: "Tiếng Hungary", label: "Tiếng Hungary" },
  { value: "Tiếng Hy Lạp", label: "Tiếng Hy Lạp" },
  { value: "Tiếng Iceland", label: "Tiếng Iceland" },
  { value: "Tiếng Igbo", label: "Tiếng Igbo" },
  { value: "Tiếng Indonesia", label: "Tiếng Indonesia" },
  { value: "Tiếng Ireland", label: "Tiếng Ireland" },
  { value: "Tiếng Ý", label: "Tiếng Ý" },
  { value: "Tiếng Java", label: "Tiếng Java" },
  { value: "Tiếng Kannada", label: "Tiếng Kannada" },
  { value: "Tiếng Kazakh", label: "Tiếng Kazakh" },
  { value: "Tiếng Khmer", label: "Tiếng Khmer" },
  { value: "Tiếng Kinyarwanda", label: "Tiếng Kinyarwanda" },
  { value: "Tiếng Kurd (Kurmanji)", label: "Tiếng Kurd (Kurmanji)" },
  { value: "Tiếng Kyrgyz", label: "Tiếng Kyrgyz" },
  { value: "Tiếng Lào", label: "Tiếng Lào" },
  { value: "Tiếng Latinh", label: "Tiếng Latinh" },
  { value: "Tiếng Latvia", label: "Tiếng Latvia" },
  { value: "Tiếng Litva", label: "Tiếng Litva" },
  { value: "Tiếng Luxembourg", label: "Tiếng Luxembourg" },
  { value: "Tiếng Macedonia", label: "Tiếng Macedonia" },
  { value: "Tiếng Mã Lai", label: "Tiếng Mã Lai" },
  { value: "Tiếng Malagasy", label: "Tiếng Malagasy" },
  { value: "Tiếng Malayalam", label: "Tiếng Malayalam" },
  { value: "Tiếng Malta", label: "Tiếng Malta" },
  { value: "Tiếng Maori", label: "Tiếng Maori" },
  { value: "Tiếng Marathi", label: "Tiếng Marathi" },
  { value: "Tiếng Mông Cổ", label: "Tiếng Mông Cổ" },
  { value: "Tiếng Myanmar (Miến Điện)", label: "Tiếng Myanmar (Miến Điện)" },
  { value: "Tiếng Na Uy", label: "Tiếng Na Uy" },
  { value: "Tiếng Nepal", label: "Tiếng Nepal" },
  { value: "Tiếng Nga", label: "Tiếng Nga" },
  { value: "Tiếng Odia (Oriya)", label: "Tiếng Odia (Oriya)" },
  { value: "Tiếng Ba Lan", label: "Tiếng Ba Lan" },
  { value: "Tiếng Ba Tư", label: "Tiếng Ba Tư" },
  { value: "Tiếng Pashto", label: "Tiếng Pashto" },
  { value: "Tiếng Punjab", label: "Tiếng Punjab" },
  { value: "Tiếng Quốc tế ngữ", label: "Tiếng Quốc tế ngữ" },
  { value: "Tiếng Romania", label: "Tiếng Romania" },
  { value: "Tiếng Samoa", label: "Tiếng Samoa" },
  { value: "Tiếng Serbia", label: "Tiếng Serbia" },
  { value: "Tiếng Sesotho", label: "Tiếng Sesotho" },
  { value: "Tiếng Shona", label: "Tiếng Shona" },
  { value: "Tiếng Sindhi", label: "Tiếng Sindhi" },
  { value: "Tiếng Sinhala", label: "Tiếng Sinhala" },
  { value: "Tiếng Slovak", label: "Tiếng Slovak" },
  { value: "Tiếng Slovenia", label: "Tiếng Slovenia" },
  { value: "Tiếng Somali", label: "Tiếng Somali" },
  { value: "Tiếng Sunda", label: "Tiếng Sunda" },
  { value: "Tiếng Swahili", label: "Tiếng Swahili" },
  { value: "Tiếng Tajik", label: "Tiếng Tajik" },
  { value: "Tiếng Tamil", label: "Tiếng Tamil" },
  { value: "Tiếng Tatar", label: "Tiếng Tatar" },
  { value: "Tiếng Telugu", label: "Tiếng Telugu" },
  { value: "Tiếng Thái", label: "Tiếng Thái" },
  { value: "Tiếng Thổ Nhĩ Kỳ", label: "Tiếng Thổ Nhĩ Kỳ" },
  { value: "Tiếng Thụy Điển", label: "Tiếng Thụy Điển" },
  { value: "Tiếng Trung (Phồn thể)", label: "Tiếng Trung (Phồn thể)" },
  { value: "Tiếng Turkmen", label: "Tiếng Turkmen" },
  { value: "Tiếng Ukraina", label: "Tiếng Ukraina" },
  { value: "Tiếng Urdu", label: "Tiếng Urdu" },
  { value: "Tiếng Uzbek", label: "Tiếng Uzbek" },
  { value: "Tiếng Wales", label: "Tiếng Wales" },
  { value: "Tiếng Xhosa", label: "Tiếng Xhosa" },
  { value: "Tiếng Yid", label: "Tiếng Yid" },
  { value: "Tiếng Yoruba", label: "Tiếng Yoruba" },
  { value: "Tiếng Zulu", label: "Tiếng Zulu" }
];

const customStyles = {
  control: (base: any) => ({
    ...base,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    boxShadow: 'none',
    minHeight: '38px',
    cursor: 'text'
  }),
  menu: (base: any) => ({
    ...base,
    backgroundColor: '#1e293b',
    zIndex: 50
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isFocused ? '#334155' : 'transparent',
    color: '#f8fafc',
    cursor: 'pointer'
  }),
  singleValue: (base: any) => ({
    ...base,
    color: 'inherit'
  }),
  input: (base: any) => ({
    ...base,
    color: 'inherit'
  })
};

const langToEdgeVoice: Record<string, string> = {
  "Tiếng Việt": "vi-VN-HoaiMyNeural",
  "Tiếng Nhật": "ja-JP-NanamiNeural",
  "Tiếng Anh": "en-US-AriaNeural",
  "Tiếng Trung (Giản thể)": "zh-CN-XiaoxiaoNeural",
  "Tiếng Hàn": "ko-KR-SunHiNeural",
  "Tiếng Pháp": "fr-FR-DeniseNeural",
  "Tiếng Tây Ban Nha": "es-ES-ElviraNeural",
  "Tiếng Đức": "de-DE-KatjaNeural",
  "Tiếng Nga": "ru-RU-SvetlanaNeural",
  "Tiếng Thái": "th-TH-PremwadeeNeural"
};


const guessLanguage = (text: string) => {
  if (/[぀-ゟ゠-ヿ]/.test(text)) return "Tiếng Nhật";
  if (/[가-힣]/.test(text)) return "Tiếng Hàn";
  if (/[一-鿿]/.test(text)) return "Tiếng Trung (Giản thể)";
  if (/[а-яА-Я]/.test(text)) return "Tiếng Nga";
  if (/[ก-๙]/.test(text)) return "Tiếng Thái";
  if (/^[a-zA-Z0-9\s\.,!?]+$/.test(text)) return "Tiếng Anh";
  return "Tiếng Việt";
};

const fallbackTTS = (content: string, lang: string, setPlaying: any) => {
  const utterance = new SpeechSynthesisUtterance(content);
  const langToCode: any = { "Tiếng Việt": "vi-VN", "Tiếng Nhật": "ja-JP", "Tiếng Anh": "en-US", "Tiếng Trung (Giản thể)": "zh-CN", "Tiếng Hàn": "ko-KR", "Tiếng Pháp": "fr-FR", "Tiếng Tây Ban Nha": "es-ES", "Tiếng Đức": "de-DE", "Tiếng Nga": "ru-RU", "Tiếng Thái": "th-TH" };
  utterance.lang = langToCode[lang] || 'en-US';
  utterance.onend = () => setPlaying(false);
  utterance.onerror = () => setPlaying(false);
  window.speechSynthesis.speak(utterance);
};

export default function TranslatorWidget({ initialText = '', onApply }: TranslatorWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sourceLang, setSourceLang] = useState('Phát hiện ngôn ngữ');
  const [targetLang, setTargetLang] = useState('Tiếng Việt');
  const [text, setText] = useState(initialText);
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState('');
  
  const [isPlayingInput, setIsPlayingInput] = useState(false);
  const [isPlayingOutput, setIsPlayingOutput] = useState(false);
  const [isCopiedInput, setIsCopiedInput] = useState(false);
  const [isCopiedOutput, setIsCopiedOutput] = useState(false);

  const handleTranslate = async () => {
    if (!text.trim()) return;
    setIsTranslating(true);
    setError('');
    
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          source_lang: sourceLang,
          target_lang: targetLang
        })
      });
      
      const data = await res.json();
      if (data.status === 'success') {
        setTranslatedText(data.translated_text);
      } else {
        setError(data.message || 'Có lỗi xảy ra khi dịch.');
      }
    } catch (err: any) {
      setError(err.message || 'Không thể kết nối đến server.');
    } finally {
      setIsTranslating(false);
    }
  };

  const swapLanguages = () => {
    if (sourceLang === 'Phát hiện ngôn ngữ') return;
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
  };

  const handleCopy = (content: string, setCopied: any) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleListen = async (content: string, lang: string, setPlaying: any) => {
    if (!content) return;
    setPlaying(true);
    
    let effectiveLang = lang;
    if (effectiveLang === "Phát hiện ngôn ngữ") {
      effectiveLang = guessLanguage(content);
    }

    const voice = langToEdgeVoice[effectiveLang];
    if (voice) {
      try {
        const res = await fetch(`/api/tts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: content,
            voice: voice,
            speed: 1.0
          })
        });
        if (!res.ok) throw new Error("API error");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.onended = () => setPlaying(false);
        audio.onerror = () => {
          setPlaying(false);
          fallbackTTS(content, effectiveLang, setPlaying);
        };
        audio.play().catch(e => {
          console.error("Audio play error", e);
          fallbackTTS(content, effectiveLang, setPlaying);
        });
      } catch (e) {
        console.error("TTS API error", e);
        fallbackTTS(content, effectiveLang, setPlaying);
      }
    } else {
      fallbackTTS(content, effectiveLang, setPlaying);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
      >
        <Languages size={16} />
        Trợ lý Dịch thuật
      </button>
    );
  }

  return (
    <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-xl animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
          <Languages size={18} />
          Trợ lý Dịch thuật
        </h3>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          &times;
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus-within:ring-2 focus-within:ring-indigo-500 text-slate-800 dark:text-slate-200">
          <CreatableSelect
            options={LANGUAGES_OPTIONS}
            value={{ value: sourceLang, label: sourceLang }}
            onChange={(newValue: any) => setSourceLang(newValue?.value || '')}
            styles={customStyles}
            formatCreateLabel={(val) => `Dùng "${val}"`}
            placeholder="Ngôn ngữ nguồn..."
          />
        </div>
        
        <button 
          onClick={swapLanguages}
          className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          title="Hoán đổi ngôn ngữ"
        >
          <ArrowLeftRight size={16} />
        </button>

        <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus-within:ring-2 focus-within:ring-indigo-500 text-slate-800 dark:text-slate-200">
          <CreatableSelect
            options={LANGUAGES_OPTIONS}
            value={{ value: targetLang, label: targetLang }}
            onChange={(newValue: any) => setTargetLang(newValue?.value || '')}
            styles={customStyles}
            formatCreateLabel={(val) => `Dùng "${val}"`}
            placeholder="Ngôn ngữ đích..."
          />
        </div>
      </div>

      <div className="relative mb-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nhập văn bản cần dịch..."
          className="w-full min-h-[100px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none pb-12"
        />
        {text && (
          <div className="absolute bottom-2 right-2 flex gap-1">
            <button 
              onClick={() => handleListen(text, sourceLang, setIsPlayingInput)} 
              disabled={isPlayingInput}
              className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              title="Nghe"
            >
              {isPlayingInput ? <Loader2 size={16} className="animate-spin" /> : <Volume2 size={16} />}
            </button>
            <button 
              onClick={() => handleCopy(text, setIsCopiedInput)}
              className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Sao chép"
            >
              {isCopiedInput ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={handleTranslate}
          disabled={isTranslating || !text.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isTranslating ? <Loader2 size={16} className="animate-spin" /> : <Languages size={16} />}
          {isTranslating ? 'Đang dịch...' : 'Dịch ngay'}
        </button>
      </div>

      {error && (
        <div className="mt-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {translatedText && (
        <div className="mt-4 pt-4 border-t border-indigo-100 dark:border-indigo-800/50">
          <label className="block text-xs font-medium text-indigo-800 dark:text-indigo-300 mb-2">Kết quả dịch:</label>
          <div className="bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700/50 rounded-lg text-sm mb-3 text-slate-800 dark:text-slate-200 flex flex-col overflow-hidden">
            <div className="p-3 pb-4 min-h-[60px]">
              {translatedText}
            </div>
            <div className="flex justify-end gap-1 p-2 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700/50">
              <button 
                onClick={() => handleListen(translatedText, targetLang, setIsPlayingOutput)}
                disabled={isPlayingOutput}
                className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                title="Nghe"
              >
                {isPlayingOutput ? <Loader2 size={16} className="animate-spin" /> : <Volume2 size={16} />}
              </button>
              <button 
                onClick={() => handleCopy(translatedText, setIsCopiedOutput)}
                className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                title="Sao chép"
              >
                {isCopiedOutput ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
          <button
            onClick={() => onApply(translatedText)}
            className="w-full bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Check size={16} />
            Sử dụng làm Câu mẫu
          </button>
        </div>
      )}
    </div>
  );
}
