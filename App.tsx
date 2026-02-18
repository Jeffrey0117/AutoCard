import React, { useState, useRef, useEffect } from 'react';
import { THEMES, INITIAL_MARKDOWN, FONTS } from './constants';
import Editor from './components/Editor';
import Preview from './components/Preview';
import Toolbar from './components/Toolbar';
import AIGenerator from './components/AIGenerator';
import AIPanel from './components/AIPanel';
import SocialCaptionPanel from './components/SocialCaptionPanel';
import { PanelLeft, PanelRight, ClipboardPaste, Trash2, Layers } from 'lucide-react';
import { FontFamily } from './types';

const App: React.FC = () => {
  const [markdown, setMarkdown] = useState(() => {
    return localStorage.getItem('autocard_markdown') || INITIAL_MARKDOWN;
  });
  const [currentThemeId, setCurrentThemeId] = useState(() => {
    return localStorage.getItem('autocard_theme') || THEMES[0].id;
  });
  const [currentFontId, setCurrentFontId] = useState<FontFamily>(() => {
    return (localStorage.getItem('autocard_font') as FontFamily) || THEMES[0].defaultFontFamily;
  });
  const [projectTitle, setProjectTitle] = useState(() => {
    return localStorage.getItem('autocard_title') || 'AutoCard';
  });
  
  const [showAI, setShowAI] = useState(false);
  const [showSocial, setShowSocial] = useState(false); // New state
  const [showEditor, setShowEditor] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const currentTheme = THEMES.find(t => t.id === currentThemeId) || THEMES[0];
  const currentFont = FONTS.find(f => f.id === currentFontId) || FONTS[0];

  // 保存設定到 localStorage
  useEffect(() => {
    localStorage.setItem('autocard_theme', currentThemeId);
  }, [currentThemeId]);

  useEffect(() => {
    localStorage.setItem('autocard_font', currentFontId);
  }, [currentFontId]);

  useEffect(() => {
    localStorage.setItem('autocard_title', projectTitle);
  }, [projectTitle]);

  useEffect(() => {
    localStorage.setItem('autocard_markdown', markdown);
  }, [markdown]);

  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setShowEditor(true);
        setShowPreview(false);
      } else {
        setShowEditor(true);
        setShowPreview(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown).then(() => {
      alert("已複製 Markdown 到剪貼簿！");
    });
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setMarkdown(text);
    } catch {
      // clipboard permission denied
    }
  };

  const handleClear = () => {
    setMarkdown('');
  };

  const insertPageBreak = () => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = `${markdown.substring(0, start)}\n\n---\n\n${markdown.substring(end)}`;
      setMarkdown(newText);
    }
  };

  const toggleView = () => {
    if (showEditor) {
      setShowEditor(false);
      setShowPreview(true);
    } else {
      setShowEditor(true);
      setShowPreview(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Toolbar
        themes={THEMES}
        currentThemeId={currentThemeId}
        currentFontId={currentFontId}
        title={projectTitle}
        onTitleChange={setProjectTitle}
        onThemeChange={setCurrentThemeId}
        onFontChange={setCurrentFontId}
        onToggleAI={() => { setShowAI(!showAI); setShowSocial(false); }}
        onToggleSocial={() => { setShowSocial(!showSocial); setShowAI(false); }}
        onCopy={handleCopy}
      />

      <AIGenerator onGenerate={setMarkdown} />

      <main className="flex-1 flex flex-col overflow-hidden relative px-3 sm:px-6 md:px-12 lg:px-32 xl:px-48 2xl:px-64 bg-slate-100">
        {/* Mobile Toggle */}
        {isMobile && (
          <button
            onClick={toggleView}
            className="absolute bottom-6 right-4 z-50 bg-slate-900 text-white p-3 rounded-full shadow-xl"
          >
            {showEditor ? <PanelRight className="w-6 h-6" /> : <PanelLeft className="w-6 h-6" />}
          </button>
        )}

        {/* Editor Pane - 上方 */}
        {showEditor && (
          <div className={`
            flex flex-col min-w-0 bg-white rounded-t-xl shadow-sm border border-slate-200 border-b-0 transition-all duration-300 mt-4
            ${isMobile ? 'flex-1' : 'h-[60%]'}
          `}>
             <div className="px-3 sm:px-6 py-1.5 text-xs font-medium text-slate-500 tracking-wide border-b border-slate-100 flex justify-between items-center gap-2">
               <span className="shrink-0">編輯器</span>
               <div className="flex items-center gap-1">
                 <button onClick={handlePaste} className="flex items-center gap-1 px-1.5 sm:px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded text-[11px] font-medium transition-colors" title="貼上">
                   <ClipboardPaste className="w-3.5 h-3.5" />
                   <span className="hidden sm:inline">貼上</span>
                 </button>
                 <button onClick={handleClear} className="flex items-center gap-1 px-1.5 sm:px-2 py-1 bg-red-50 hover:bg-red-100 text-red-500 rounded text-[11px] font-medium transition-colors" title="清空">
                   <Trash2 className="w-3.5 h-3.5" />
                   <span className="hidden sm:inline">清空</span>
                 </button>
                 <button onClick={insertPageBreak} className="flex items-center gap-1 px-1.5 sm:px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[11px] font-medium transition-colors" title="分頁">
                   <Layers className="w-3.5 h-3.5" />
                   <span className="hidden sm:inline">分頁</span>
                 </button>
               </div>
             </div>
             <Editor
                value={markdown}
                onChange={setMarkdown}
             />
          </div>
        )}

        {/* Preview Pane - 下方 */}
        {showPreview && (
          <div className={`
            flex flex-col min-w-0 bg-white rounded-b-xl shadow-sm border border-slate-200 border-t-0 transition-all duration-300 mb-4
            ${isMobile ? 'flex-1' : 'h-[40%]'}
          `}>
             <Preview
                content={markdown}
                theme={currentTheme}
                fontOption={currentFont}
                title={projectTitle}
                previewRef={previewRef}
             />
          </div>
        )}

        {/* AI Overlay Panels */}
        {showAI && (
          <AIPanel 
            currentText={markdown}
            onReplace={setMarkdown}
            onClose={() => setShowAI(false)}
          />
        )}

        {showSocial && (
          <SocialCaptionPanel 
            currentText={markdown}
            onClose={() => setShowSocial(false)}
          />
        )}
      </main>
    </div>
  );
};

export default App;