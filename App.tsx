import React, { useState, useRef, useEffect } from 'react';
import { THEMES, INITIAL_MARKDOWN, FONTS } from './constants';
import Editor from './components/Editor';
import Preview from './components/Preview';
import Toolbar from './components/Toolbar';
import AIPanel from './components/AIPanel';
import SocialCaptionPanel from './components/SocialCaptionPanel';
import { PanelLeft, PanelRight } from 'lucide-react';
import { FontFamily } from './types';

const App: React.FC = () => {
  const [markdown, setMarkdown] = useState(INITIAL_MARKDOWN);
  const [currentThemeId, setCurrentThemeId] = useState(THEMES[0].id);
  const [currentFontId, setCurrentFontId] = useState<FontFamily>(THEMES[0].defaultFontFamily);
  const [projectTitle, setProjectTitle] = useState('AutoCard');
  
  const [showAI, setShowAI] = useState(false);
  const [showSocial, setShowSocial] = useState(false); // New state
  const [showEditor, setShowEditor] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const currentTheme = THEMES.find(t => t.id === currentThemeId) || THEMES[0];
  const currentFont = FONTS.find(f => f.id === currentFontId) || FONTS[0];

  // When theme changes, reset to that theme's default font
  useEffect(() => {
    setCurrentFontId(currentTheme.defaultFontFamily);
  }, [currentThemeId]);

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

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile Toggle */}
        {isMobile && (
          <button
            onClick={toggleView}
            className="absolute bottom-6 right-6 z-50 bg-slate-900 text-white p-4 rounded-full shadow-xl"
          >
            {showEditor ? <PanelRight className="w-6 h-6" /> : <PanelLeft className="w-6 h-6" />}
          </button>
        )}

        {/* Editor Pane - 上方 */}
        {showEditor && (
          <div className={`
            flex flex-col min-w-0 bg-white border-b border-slate-200 transition-all duration-300
            ${isMobile ? 'flex-1' : 'h-[60%]'}
          `}>
             <div className="px-6 py-2 text-xs font-bold text-slate-400 tracking-widest uppercase border-b border-slate-100 flex justify-between items-center">
               <span>編輯器</span>
               <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500">Markdown</span>
             </div>
             <Editor
                value={markdown}
                onChange={setMarkdown}
                fontOption={currentFont}
             />
          </div>
        )}

        {/* Preview Pane - 下方 */}
        {showPreview && (
          <div className={`
            flex flex-col min-w-0 bg-slate-100/80 transition-all duration-300
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