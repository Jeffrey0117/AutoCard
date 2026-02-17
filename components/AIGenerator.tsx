import React, { useState } from 'react';
import { Sparkles, Loader2, Wand2 } from 'lucide-react';
import { generateContent } from '../services/ai';

interface AIGeneratorProps {
  onGenerate: (content: string) => void;
}

const AIGenerator: React.FC<AIGeneratorProps> = ({ onGenerate }) => {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const content = await generateContent({ topic: topic.trim(), pages: 4 });
      onGenerate(content);
      setTopic('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-3 sm:px-6 md:px-12 lg:px-32 xl:px-48 2xl:px-64">
      <div className="py-3 sm:py-4 flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2 text-white/90">
          <Wand2 className="w-5 h-5" />
          <span className="text-sm font-medium hidden sm:inline">AI 生成</span>
        </div>

        <div className="flex-1 relative">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="輸入主題，例如：如何提高工作效率、旅行攻略、讀書筆記..."
            className="w-full px-4 py-2.5 bg-white/10 backdrop-blur border border-white/20 rounded-xl text-white placeholder-white/50 outline-none focus:bg-white/20 focus:border-white/40 transition-all text-sm"
            disabled={isLoading}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading || !topic.trim()}
          className="flex items-center gap-2 px-3 sm:px-5 py-2.5 bg-white text-indigo-600 rounded-xl font-medium text-sm hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">生成中...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">生成文章</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="pb-3 text-red-200 text-xs">
          {error}
        </div>
      )}
    </div>
  );
};

export default AIGenerator;
