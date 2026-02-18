import React from 'react';
import { Layers, ClipboardPaste, Trash2 } from 'lucide-react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

const Editor: React.FC<EditorProps> = ({ value, onChange }) => {
  
  const insertPageBreak = () => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const textBefore = value.substring(0, start);
        const textAfter = value.substring(end);
        const newText = `${textBefore}\n\n---\n\n${textAfter}`;
        onChange(newText);
        // Reset focus?
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) onChange(text);
    } catch {
      // Fallback: clipboard permission denied
    }
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="h-full w-full flex flex-col relative">
      <div className="flex-1 relative group">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-full p-4 sm:p-6 pb-14 resize-none outline-none bg-transparent text-slate-700 placeholder-slate-400 leading-relaxed font-mono text-sm"
          placeholder="開始輸入... 使用 '---' 分隔頁面"
          spellCheck={false}
        />
      </div>
      <div className="absolute bottom-2 left-2 right-2 sm:left-auto sm:right-4 sm:bottom-4 z-10 flex gap-2 justify-end">
         <button
            onClick={handlePaste}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full text-xs font-medium border border-indigo-200 transition-colors shadow-sm"
            title="貼上"
         >
            <ClipboardPaste className="w-3 h-3" />
            <span className="hidden sm:inline">貼上</span>
         </button>
         <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-full text-xs font-medium border border-red-200 transition-colors shadow-sm"
            title="清空"
         >
            <Trash2 className="w-3 h-3" />
            <span className="hidden sm:inline">清空</span>
         </button>
         <button
            onClick={insertPageBreak}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-xs font-medium border border-slate-200 transition-colors shadow-sm"
            title="新增頁面"
         >
            <Layers className="w-3 h-3" />
            <span className="hidden sm:inline">新增頁面</span>
         </button>
      </div>
    </div>
  );
};

export default Editor;