import React from 'react';
import { Theme, FontFamily } from '../types';
import { FONTS } from '../constants';
import { Copy, Sparkles, Type, MessageSquareText } from 'lucide-react';

interface ToolbarProps {
  themes: Theme[];
  currentThemeId: string;
  currentFontId: FontFamily;
  title: string;
  onTitleChange: (title: string) => void;
  onThemeChange: (id: string) => void;
  onFontChange: (id: FontFamily) => void;
  onToggleAI: () => void;
  onToggleSocial: () => void;
  onCopy: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  themes, 
  currentThemeId, 
  currentFontId,
  title,
  onTitleChange,
  onThemeChange, 
  onFontChange,
  onToggleAI,
  onToggleSocial,
  onCopy
}) => {
  return (
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-pink-500 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
          T
        </div>
        <input 
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="font-semibold text-slate-800 bg-transparent hover:bg-slate-100 focus:bg-white border border-transparent focus:border-slate-200 rounded px-2 py-1 outline-none transition-all w-32 md:w-48 text-sm md:text-base truncate"
            placeholder="Project Name"
        />
      </div>

      <div className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar mask-gradient pr-2">
        
        {/* Font Selector */}
        <div className="relative group shrink-0">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 text-sm font-medium transition-colors">
                <Type className="w-4 h-4" />
                <span className="hidden sm:inline">Font</span>
            </button>
            <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-1 hidden group-hover:block z-50 max-h-[300px] overflow-y-auto">
                {FONTS.map(font => (
                    <button
                        key={font.id}
                        onClick={() => onFontChange(font.id)}
                        className={`
                            w-full text-left px-3 py-2 rounded-lg text-sm mb-0.5
                            ${currentFontId === font.id ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-700'}
                            ${font.cssValue}
                        `}
                    >
                        {font.name}
                    </button>
                ))}
            </div>
        </div>

        <div className="h-6 w-px bg-slate-200 mx-1 shrink-0"></div>

        {/* Theme Selector */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg shrink-0">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => onThemeChange(theme.id)}
              className={`
                w-6 h-6 rounded-md flex items-center justify-center transition-all
                ${currentThemeId === theme.id ? 'bg-white shadow-sm scale-110' : 'hover:bg-slate-200'}
              `}
              title={theme.name}
            >
              <div className={`w-3 h-3 rounded-full ${theme.headingColor.replace('text-', 'bg-')}`}></div>
            </button>
          ))}
        </div>

        <div className="h-6 w-px bg-slate-200 mx-1 shrink-0"></div>

        <button 
          onClick={onToggleSocial}
          className="flex items-center gap-2 px-3 py-1.5 bg-pink-50 text-pink-600 rounded-full hover:bg-pink-100 transition-colors text-sm font-medium border border-pink-200 whitespace-nowrap shrink-0"
        >
          <MessageSquareText className="w-4 h-4" />
          <span className="hidden lg:inline">Caption</span>
        </button>

        <button 
          onClick={onToggleAI}
          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors text-sm font-medium border border-indigo-200 whitespace-nowrap shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span className="hidden lg:inline">AI Assist</span>
        </button>

        <button 
          onClick={onCopy}
          className="flex items-center gap-2 px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors text-sm font-medium whitespace-nowrap shrink-0"
        >
          <Copy className="w-4 h-4" />
          <span className="hidden lg:inline">Copy MD</span>
        </button>
      </div>
    </header>
  );
};

export default Toolbar;