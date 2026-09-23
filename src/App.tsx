import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './screens/Home';
import SetText from './screens/SetText';
import ConversationScript from './screens/ConversationScript';
import { Sun, Moon } from 'lucide-react';

function App() {
  const [currentText, setCurrentText] = useState("こんにちは、いい天気ですね。");
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-200 relative">
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="fixed top-4 right-4 z-50 p-2.5 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
        title={isDarkMode ? "Chuyển sang nền sáng" : "Chuyển sang nền tối"}
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home text={currentText} />} />
          <Route path="/set-text" element={<SetText initialText={currentText} onSave={setCurrentText} />} />
          <Route path="/script" element={<ConversationScript />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
