import React, { useState } from 'react';
import { MessageSquareText, Copy, Check, Loader2, X, ListOrdered, Share2 } from 'lucide-react';
import { generateSocialCaptions } from '../services/geminiService';

interface SocialCaptionPanelProps {
  currentText: string;
  onClose: () => void;
}

const SocialCaptionPanel: React.FC<SocialCaptionPanelProps> = ({ currentText, onClose }) => {
  const [isThreadMode, setIsThreadMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [captions, setCaptions] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (!currentText) return;
    setIsLoading(true);
    setCaptions([]);
    try {
        const results = await generateSocialCaptions(currentText, isThreadMode);
        setCaptions(results);
    } catch (e) {
        console.error(e);
        alert("生成失敗，請重試。");
    } finally {
        setIsLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="absolute top-16 right-4 md:right-8 w-[90vw] md:w-[400px] bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6 z-50 animate-in fade-in slide-in-from-top-4 flex flex-col max-h-[80vh]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-pink-600 flex items-center gap-2">
          <MessageSquareText className="w-5 h-5" />
          社群文案 AI
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100 mb-6">
        <div className="flex items-center gap-2">
            <ListOrdered className={`w-4 h-4 ${isThreadMode ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span className="text-sm font-medium text-slate-700">串文模式</span>
        </div>
        <button
            onClick={() => setIsThreadMode(!isThreadMode)}
            className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                ${isThreadMode ? 'bg-indigo-600' : 'bg-slate-200'}
            `}
        >
            <span className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${isThreadMode ? 'translate-x-6' : 'translate-x-1'}
            `} />
        </button>
      </div>

      {captions.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-xl mb-4">
               <Share2 className="w-8 h-8 text-slate-300 mb-2" />
               <p className="text-slate-500 text-sm mb-4">
                  {isThreadMode
                    ? "為 Twitter/Threads 生成串文系列貼文。"
                    : "為 Instagram 生成一則吸引人的貼文。"}
               </p>
               <button
                    onClick={handleGenerate}
                    disabled={isLoading || !currentText}
                    className="bg-pink-600 text-white px-6 py-2 rounded-full font-medium hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-md shadow-pink-200"
               >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquareText className="w-4 h-4" />}
                    生成文案
               </button>
          </div>
      ) : (
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 mb-4">
              {captions.map((caption, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 relative group hover:border-pink-200 transition-colors">
                      <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                        {isThreadMode ? `第 ${idx + 1} 則` : '貼文'}
                      </div>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{caption}</p>
                      <button
                        onClick={() => handleCopy(caption, idx)}
                        className="absolute top-3 right-3 p-1.5 bg-white text-slate-500 rounded-md shadow-sm border border-slate-100 hover:text-pink-600 hover:border-pink-200 opacity-0 group-hover:opacity-100 transition-all"
                      >
                         {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-500"/> : <Copy className="w-3.5 h-3.5"/>}
                      </button>
                  </div>
              ))}
          </div>
      )}

      {captions.length > 0 && (
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition-colors text-sm flex items-center justify-center gap-2"
          >
             {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "重新生成"}
          </button>
      )}
    </div>
  );
};

export default SocialCaptionPanel;
