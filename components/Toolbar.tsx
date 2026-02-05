import React, { useState, useRef, useEffect } from 'react';
import { Theme, FontFamily } from '../types';
import { FONTS } from '../constants';
import { Copy, Sparkles, Type, MessageSquareText, Palette, ChevronDown, X } from 'lucide-react';

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

const THEME_NAMES: Record<string, { name: string; desc: string }> = {
  'notebook': { name: '學生筆記', desc: '手寫風格' },
  'grid': { name: '方格紙', desc: '清爽乾淨' },
  'summer': { name: '夏日微風', desc: '清新自然' },
  'purple-dream': { name: '紫色夢境', desc: '時尚大膽' },
  'editorial': { name: '雜誌風格', desc: '專業質感' },
};

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
  const [openDropdown, setOpenDropdown] = useState<'theme' | 'font' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside 關閉
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentTheme = themes.find(t => t.id === currentThemeId);
  const currentFont = FONTS.find(f => f.id === currentFontId);

  return (
    <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-4 sticky top-0 z-40">
      {/* Logo + Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-pink-500 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-md">
          A
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="font-semibold text-slate-800 bg-transparent hover:bg-slate-100 focus:bg-white border border-transparent focus:border-slate-300 rounded-lg px-2 py-1 outline-none transition-all w-28 md:w-40 text-sm truncate"
          placeholder="專案名稱"
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1.5" ref={dropdownRef}>
        {/* Theme Selector */}
        <div className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === 'theme' ? null : 'theme')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              openDropdown === 'theme' ? 'bg-slate-200 text-slate-900' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <div
              className="w-4 h-5 rounded border shadow-sm"
              style={{ backgroundColor: currentTheme?.backgroundColor }}
            />
            <span className="hidden md:inline">{THEME_NAMES[currentThemeId]?.name || '主題'}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === 'theme' ? 'rotate-180' : ''}`} />
          </button>

          {openDropdown === 'theme' && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl p-2 z-50">
              <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-slate-100">
                <span className="text-xs font-medium text-slate-500">選擇主題</span>
                <button onClick={() => setOpenDropdown(null)} className="p-1 hover:bg-slate-100 rounded">
                  <X className="w-3 h-3 text-slate-400" />
                </button>
              </div>
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => { onThemeChange(theme.id); setOpenDropdown(null); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm mb-1 flex items-center gap-3 transition-all ${
                    currentThemeId === theme.id ? 'bg-indigo-50 ring-2 ring-indigo-300' : 'hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-10 h-12 rounded-lg border-2 shadow-sm flex-shrink-0 ${theme.slideClassName}`}
                    style={{ backgroundColor: theme.backgroundColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium truncate ${currentThemeId === theme.id ? 'text-indigo-700' : 'text-slate-700'}`}>
                      {THEME_NAMES[theme.id]?.name || theme.name}
                    </div>
                    <div className="text-xs text-slate-400">{THEME_NAMES[theme.id]?.desc}</div>
                  </div>
                  {currentThemeId === theme.id && (
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font Selector */}
        <div className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === 'font' ? null : 'font')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              openDropdown === 'font' ? 'bg-slate-200 text-slate-900' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <Type className="w-4 h-4" />
            <span className="hidden md:inline">{currentFont?.name || '字型'}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === 'font' ? 'rotate-180' : ''}`} />
          </button>

          {openDropdown === 'font' && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-2xl p-2 z-50 max-h-[400px] overflow-y-auto">
              <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-slate-100">
                <span className="text-xs font-medium text-slate-500">選擇字型</span>
                <button onClick={() => setOpenDropdown(null)} className="p-1 hover:bg-slate-100 rounded">
                  <X className="w-3 h-3 text-slate-400" />
                </button>
              </div>
              {FONTS.map(font => (
                <button
                  key={font.id}
                  onClick={() => { onFontChange(font.id); setOpenDropdown(null); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm mb-0.5 transition-all flex items-center justify-between ${
                    currentFontId === font.id ? 'bg-indigo-50 ring-2 ring-indigo-300' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className={`${font.cssValue} ${currentFontId === font.id ? 'text-indigo-700' : 'text-slate-700'}`}>
                    {font.name}
                  </span>
                  {currentFontId === font.id && (
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 mx-1" />

        {/* Action Buttons */}
        <button
          onClick={onToggleSocial}
          className="flex items-center gap-1.5 px-3 py-2 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-colors text-sm font-medium"
        >
          <MessageSquareText className="w-4 h-4" />
          <span className="hidden lg:inline">文案</span>
        </button>

        <button
          onClick={onToggleAI}
          className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
        >
          <Sparkles className="w-4 h-4" />
          <span className="hidden lg:inline">AI</span>
        </button>

        <button
          onClick={onCopy}
          className="flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-sm"
        >
          <Copy className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Toolbar;
