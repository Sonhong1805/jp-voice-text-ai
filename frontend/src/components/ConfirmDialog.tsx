import { Trash2 } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/50 rounded-3xl max-w-sm w-full shadow-[0_0_40px_rgba(0,0,0,0.5)] relative animate-in zoom-in-95 duration-300 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl"></div>

        <div className="p-8 text-center relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-5 border border-red-500/20 shadow-inner">
            <Trash2 size={28} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 mb-3">{title}</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">{message}</p>
          <div className="flex gap-3 w-full">
            <button 
              onClick={onCancel}
              className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors border border-slate-300 dark:border-slate-700"
            >
              Huỷ
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-slate-900 dark:text-white rounded-xl font-medium transition-colors shadow-lg shadow-red-600/20"
            >
              Xoá
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
