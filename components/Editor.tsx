import React from 'react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

const Editor: React.FC<EditorProps> = ({ value, onChange }) => {
  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-1 relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-full p-4 sm:p-6 resize-none outline-none bg-transparent text-slate-700 placeholder-slate-400 leading-relaxed font-mono text-sm"
          placeholder="開始輸入... 使用 '---' 分隔頁面"
          spellCheck={false}
        />
      </div>
    </div>
  );
};

export default Editor;