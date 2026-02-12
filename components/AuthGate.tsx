import React, { useState, useEffect } from 'react';
import { verify, login } from '../services/auth';
import { Lock } from 'lucide-react';

interface AuthGateProps {
  children: React.ReactNode;
}

const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    verify().then(setAuthed);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(password);
    setLoading(false);
    if (result.success) {
      setAuthed(true);
    } else {
      setError(result.error || '密碼錯誤');
      setPassword('');
    }
  };

  // 驗證中
  if (authed === null) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-400 text-sm">載入中...</div>
      </div>
    );
  }

  // 已登入
  if (authed) return <>{children}</>;

  // 登入畫面
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-lg p-8 w-80 flex flex-col items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center">
          <Lock className="w-7 h-7 text-indigo-500" />
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold text-slate-800">AutoCard</h1>
          <p className="text-sm text-slate-400 mt-1">請輸入密碼</p>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="密碼"
          autoFocus
          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-center text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
        />
        {error && <p className="text-red-500 text-xs -mt-2">{error}</p>}
        <button
          type="submit"
          disabled={loading || !password}
          className="w-full py-2.5 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 disabled:opacity-40 transition"
        >
          {loading ? '驗證中...' : '登入'}
        </button>
      </form>
    </div>
  );
};

export default AuthGate;
