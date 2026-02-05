import React, { useState } from 'react';
import { Sparkles, Wand2, Loader2, Check, X } from 'lucide-react';
import { AIServiceAction } from '../types';
import { generateAIContent, generateFromTopic } from '../services/geminiService';

interface AIPanelProps {
  currentText: string;
  onReplace: (text: string) => void;
  onClose: () => void;
}

const AIPanel: React.FC<AIPanelProps> = ({ currentText, onReplace, onClose }) => {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async (action: AIServiceAction) => {
    if (!currentText && action !== AIServiceAction.EXPAND) {
        setError("請先在編輯器中輸入一些文字。");
        return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await generateAIContent(currentText, action);
      setGeneratedText(result);
    } catch (err) {
      setError("生成失敗，請重試。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopicGenerate = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateFromTopic(topic);
      setGeneratedText(result);
    } catch (err) {
      setError("生成失敗。");
    } finally {
      setIsLoading(false);
    }
  };

  const applyChanges = () => {
    if (generatedText) {
      onReplace(generatedText);
      onClose();
    }
  };

  return (
    <div className="absolute top-16 left-4 right-4 md:left-auto md:right-8 md:w-96 bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6 z-50 animate-in fade-in slide-in-from-top-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          AI 助手
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      {!generatedText ? (
        <div className="space-y-4">
           {/* 主題生成區 */}
           <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">從頭開始</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="輸入主題（例如：咖啡沖泡技巧）"
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <button
                onClick={handleTopicGenerate}
                disabled={isLoading || !topic.trim()}
                className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
              </button>
            </div>
           </div>

           <div className="border-t border-slate-100 my-4"></div>

           {/* 優化現有文字區 */}
           <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">優化現有文字</label>
            <div className="grid grid-cols-2 gap-2">
                <button disabled={isLoading} onClick={() => handleAction(AIServiceAction.IMPROVE)} className="p-2 text-sm text-left bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-lg transition-colors border border-slate-200">
                    ✨ 改善文筆
                </button>
                <button disabled={isLoading} onClick={() => handleAction(AIServiceAction.FIX_GRAMMAR)} className="p-2 text-sm text-left bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-lg transition-colors border border-slate-200">
                    📝 修正語法
                </button>
                <button disabled={isLoading} onClick={() => handleAction(AIServiceAction.MAKE_SOCIAL)} className="p-2 text-sm text-left bg-slate-50 hover:bg-pink-50 text-slate-700 hover:text-pink-700 rounded-lg transition-colors border border-slate-200">
                    📱 社群風格
                </button>
                <button disabled={isLoading} onClick={() => handleAction(AIServiceAction.SUMMARIZE)} className="p-2 text-sm text-left bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-orange-700 rounded-lg transition-colors border border-slate-200">
                    🤏 摘要精簡
                </button>
            </div>
           </div>
        </div>
      ) : (
        <div className="flex flex-col h-[300px]">
          <div className="flex-1 overflow-y-auto bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm mb-4">
             <div className="whitespace-pre-wrap">{generatedText}</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setGeneratedText(null)}
              className="flex-1 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm"
            >
              放棄
            </button>
            <button
              onClick={applyChanges}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" /> 套用
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPanel;
