import React, { useState, useEffect } from 'react';
import { FolderOpen, X, Trash2, FileText, Loader2, Search } from 'lucide-react';
import { getAuthHeaders } from '../services/auth';

interface PoolItem {
  id: string;
  title: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface ContentPoolPanelProps {
  onLoad: (title: string, markdown: string) => void;
  onClose: () => void;
}

const ContentPoolPanel: React.FC<ContentPoolPanelProps> = ({ onLoad, onClose }) => {
  const [items, setItems] = useState<PoolItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/pool', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleLoad = async (id: string) => {
    try {
      const res = await fetch(`/api/pool/${id}`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        onLoad(data.item.title, data.item.markdown);
        onClose();
      }
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/pool/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setItems(prev => prev.filter(p => p.id !== id));
      }
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = search.trim()
    ? items.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
      )
    : items;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute top-16 left-2 right-2 sm:left-4 sm:right-4 md:left-auto md:right-8 md:w-[420px] bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-4 sm:p-6 z-50 flex flex-col max-h-[80vh]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-indigo-500" />
          內容庫
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜尋標題或標籤..."
          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-300 transition-colors"
        />
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
            <FileText className="w-8 h-8" />
            <p className="text-sm">{search ? '找不到符合的內容' : '還沒有儲存的內容'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(item => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors group"
              >
                <button
                  onClick={() => handleLoad(item.id)}
                  className="flex-1 text-left min-w-0"
                >
                  <div className="font-medium text-sm text-slate-700 truncate">
                    {item.title}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-slate-400">{formatDate(item.updatedAt)}</span>
                    {item.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {item.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                  title="刪除"
                >
                  {deletingId === item.id
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Trash2 className="w-3.5 h-3.5" />
                  }
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 text-center text-[10px] text-slate-400">
        {items.length} 筆內容
      </div>
    </div>
  );
};

export default ContentPoolPanel;
