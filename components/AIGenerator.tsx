import React, { useState } from 'react';
import { Sparkles, Loader2, Wand2, Lightbulb, Check } from 'lucide-react';
import { generateContent } from '../services/ai';
import { getAuthHeaders } from '../services/auth';

interface AIGeneratorProps {
  onGenerate: (content: string) => void;
}

const CATEGORIES = ['CSS', '前端', 'JavaScript', 'React', 'TypeScript', 'Node.js', 'Python', '設計', '效率工具', '職場成長', '自我提升', '行銷策略'];

const AIGenerator: React.FC<AIGeneratorProps> = ({ onGenerate }) => {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inspiration mode
  const [showInspiration, setShowInspiration] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const [checkedTopics, setCheckedTopics] = useState<Set<number>>(new Set());
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });

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

  const handleSuggest = async (category: string) => {
    setSelectedCategory(category);
    setSuggestedTopics([]);
    setCheckedTopics(new Set());
    setIsSuggesting(true);
    setError(null);
    try {
      const res = await fetch('/api/suggest-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ category }),
      });
      if (!res.ok) throw new Error('推薦失敗');
      const data = await res.json();
      setSuggestedTopics(data.topics || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '推薦失敗');
    } finally {
      setIsSuggesting(false);
    }
  };

  const toggleCheck = (idx: number) => {
    setCheckedTopics(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleBatchGenerate = async () => {
    const selected = [...checkedTopics].map(i => suggestedTopics[i]).filter(Boolean);
    if (selected.length === 0) return;

    setIsBatchGenerating(true);
    setBatchProgress({ current: 0, total: selected.length });

    for (let i = 0; i < selected.length; i++) {
      const t = selected[i];
      setBatchProgress({ current: i + 1, total: selected.length });
      try {
        const content = await generateContent({ topic: t, pages: 4 });

        // Auto-save to pool
        await fetch('/api/pool', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify({ title: t, markdown: content, tags: [selectedCategory] }),
        }).catch(() => {});

        // Load last one into editor
        if (i === selected.length - 1) {
          onGenerate(content);
        }
      } catch {
        // skip failed
      }
    }

    setIsBatchGenerating(false);
    setSuggestedTopics([]);
    setCheckedTopics(new Set());
    setShowInspiration(false);
  };

  const checkedCount = checkedTopics.size;

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-3 sm:px-6 md:px-12 lg:px-32 xl:px-48 2xl:px-64">
      {/* Normal mode */}
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
            placeholder="輸入主題，例如：如何提高工作效率..."
            className="w-full px-4 py-2.5 bg-white/10 backdrop-blur border border-white/20 rounded-xl text-white placeholder-white/50 outline-none focus:bg-white/20 focus:border-white/40 transition-all text-sm"
            disabled={isLoading || isBatchGenerating}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading || !topic.trim() || isBatchGenerating}
          className="flex items-center gap-2 px-3 sm:px-5 py-2.5 bg-white text-indigo-600 rounded-xl font-medium text-sm hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {isLoading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /><span className="hidden sm:inline">生成中...</span></>
          ) : (
            <><Sparkles className="w-4 h-4" /><span className="hidden sm:inline">生成</span></>
          )}
        </button>

        <button
          onClick={() => setShowInspiration(!showInspiration)}
          className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg ${
            showInspiration
              ? 'bg-yellow-400 text-yellow-900'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          <span className="hidden sm:inline">靈感</span>
        </button>
      </div>

      {error && <div className="pb-3 text-red-200 text-xs">{error}</div>}

      {/* Inspiration mode panel */}
      {showInspiration && (
        <div className="pb-4 space-y-3">
          {/* Category chips */}
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => handleSuggest(cat)}
                disabled={isSuggesting || isBatchGenerating}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-white text-indigo-600 shadow'
                    : 'bg-white/15 text-white/80 hover:bg-white/25'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Loading */}
          {isSuggesting && (
            <div className="flex items-center gap-2 text-white/70 text-sm py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              正在為「{selectedCategory}」推薦主題...
            </div>
          )}

          {/* Topic checklist */}
          {suggestedTopics.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-xs">選擇要生成的主題（已選 {checkedCount} 個）</span>
                <button
                  onClick={() => {
                    if (checkedCount === suggestedTopics.length) setCheckedTopics(new Set());
                    else setCheckedTopics(new Set(suggestedTopics.map((_, i) => i)));
                  }}
                  className="text-white/60 text-xs hover:text-white underline"
                >
                  {checkedCount === suggestedTopics.length ? '取消全選' : '全選'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {suggestedTopics.map((t, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleCheck(idx)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-all ${
                      checkedTopics.has(idx)
                        ? 'bg-white/25 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/15'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
                      checkedTopics.has(idx)
                        ? 'bg-white border-white'
                        : 'border-white/40'
                    }`}>
                      {checkedTopics.has(idx) && <Check className="w-3 h-3 text-indigo-600" />}
                    </div>
                    <span className="truncate">{t}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={handleBatchGenerate}
                disabled={checkedCount === 0 || isBatchGenerating}
                className="w-full py-3 bg-white text-indigo-600 rounded-xl font-medium text-sm hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2 mt-2"
              >
                {isBatchGenerating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> 生成中 {batchProgress.current}/{batchProgress.total}</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> 批次生成 {checkedCount} 篇並存入內容庫</>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIGenerator;
