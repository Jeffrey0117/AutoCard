import React from 'react';
import { Layers } from 'lucide-react';
import { FontOption } from '../types';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  fontOption: FontOption;
}

const Editor: React.FC<EditorProps> = ({ value, onChange, fontOption }) => {
  
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

  return (
    <div className="h-full w-full flex flex-col relative">
      <div className="absolute bottom-4 right-4 z-10">
         <button 
            onClick={insertPageBreak}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-xs font-medium border border-slate-200 transition-colors shadow-sm"
            title="Insert a new page"
         >
            <Layers className="w-3 h-3" />
            <span>Add Page</span>
         </button>
      </div>
      <div className="flex-1 relative group">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            w-full h-full p-8 resize-none outline-none 
            bg-transparent text-slate-700 placeholder-slate-400
            leading-relaxed
            ${fontOption.cssValue}
          `}
          placeholder="Start typing... Use '---' to separate pages."
          spellCheck={false}
        />
      </div>
    </div>
  );
};

export default Editor;