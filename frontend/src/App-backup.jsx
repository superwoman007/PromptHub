import { useState, useEffect } from 'react';
import { Search, ArrowLeft, Copy, Check, Heart, Sparkles, X, Eye, LogOut, User, Star } from 'lucide-react';
import './index.css';

const i18n = {
  zh: {
    title: 'PromptHub',
    subtitle: '发现优质 AI 提示词',
    desc: '开源社区，分享创意提示词，让 AI 更懂你',
    searchPlaceholder: '搜索提示词...',
    all: '全部',
    views: '浏览',
    rating: '评分',
    back: '返回',
    examples: '使用示例',
    content: '提示词',
    copy: '复制',
    copied: '已复制',
    noResults: '暂无结果',
    input: '输入',
    output: '输出',
    login: '登录',
    register: '注册',
    logout: '退出',
    username: '用户名',
    password: '密码',
    submit: '确认',
  },
  en: {
    title: 'PromptHub',
    subtitle: 'Discover Quality AI Prompts',
    desc: 'Open-source community for creative prompts',
    searchPlaceholder: 'Search prompts...',
    all: 'All',
    views: 'Views',
    rating: 'Rating',
    back: 'Back',
    examples: 'Examples',
    content: 'Prompt',
    copy: 'Copy',
    copied: 'Copied',
    noResults: 'No results',
    input: 'Input',
    output: 'Output',
    login: 'Sign In',
    register: 'Sign Up',
    logout: 'Sign Out',
    username: 'Username',
    password: 'Password',
    submit: 'Submit',
  },
};

function App() {
  const [lang, setLang] = useState('zh');
  const [view, setView] = useState('home');
  const [prompts, setPrompts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [copyText, setCopyText] = useState('');
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authView, setAuthView] = useState('login');
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [favorites, setFavorites] = useState([]);
  const t = i18n[lang];

  useEffect(() => {
    fetchData();
    const token = localStorage.getItem('ph_token');
    const u = localStorage.getItem('ph_user');
    if (token && u) { setUser(JSON.parse(u)); fetchFavorites(token); }
  }, []);

  const fetchData = async () => {
    try {
      const [c, p] = await Promise.all([
        fetch('http://localhost:3001/api/categories'),
        fetch('http://localhost:3001/api/prompts'),
      ]);
      setCategories(await c.json());
      setPrompts(await p.json());
    } catch (e) { console.error(e); }
  };

  const fetchFavorites = async (token) => {
    try {
      const r = await fetch('http://localhost:3001/api/favorites', { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) setFavorites(await r.json());
    } catch (e) { console.error(e); }
  };

  const viewPrompt = async (slug) => {
    const r = await fetch(`http://localhost:3001/api/prompts/${slug}`);
    setSelectedPrompt(await r.json());
    setView('detail');
    window.scrollTo(0, 0);
  };

  const copyContent = async () => {
    await navigator.clipboard.writeText(selectedPrompt.content);
    setCopyText(t.copied);
    setTimeout(() => setCopyText(''), 2000);
  };

  const toggleFavorite = async (id) => {
    if (!user) { setShowAuth(true); return; }
    const token = localStorage.getItem('ph_token');
    const isFav = favorites.some(f => f.id === id);
    await fetch(`http://localhost:3001/api/favorites/${id}`, {
      method: isFav ? 'DELETE' : 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchFavorites(token);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    const r = await fetch(`http://localhost:3001/api/auth/${authView === 'login' ? 'login' : 'register'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authForm)
    });
    if (r.ok) {
      const d = await r.json();
      localStorage.setItem('ph_token', d.token);
      localStorage.setItem('ph_user', JSON.stringify(d.user));
      setUser(d.user);
      setShowAuth(false);
      fetchFavorites(d.token);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ph_token');
    localStorage.removeItem('ph_user');
    setUser(null);
    setFavorites([]);
  };

  const filtered = prompts.filter(p => {
    const ms = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const mc = !selectedCategory || p.category_name === selectedCategory;
    return ms && mc;
  });

  const isFav = (id) => favorites.some(f => f.id === id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {view === 'detail' && (
                <button 
                  onClick={() => setView('home')} 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all"
                >
                  <ArrowLeft size={16} />
                  {t.back}
                </button>
              )}
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Sparkles size={18} className="text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {t.title}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all"
              >
                {lang === 'zh' ? 'EN' : '中文'}
              </button>

              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 text-sm font-medium text-gray-700">
                    <User size={16} />
                    <span className="hidden sm:inline">{user.username}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all"
                  >
                    <LogOut size={16} />
                    <span className="hidden sm:inline">{t.logout}</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium hover:shadow-lg hover:scale-105 transition-all"
                >
                  {t.login}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {view === 'home' && (
          <>
            {/* Hero */}
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-bold mb-3 bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 bg-clip-text text-transparent">
                {t.subtitle}
              </h2>
              <p className="text-gray-600 text-lg max-w-xl mx-auto">{t.desc}</p>
            </div>

            {/* Search */}
            <div className="mb-10 max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="mb-10">
              <div className="flex gap-2 flex-wrap justify-center">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!selectedCategory ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}
                >
                  {t.all}
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === cat.name ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((prompt) => (
                <div
                  key={prompt.id}
                  onClick={() => viewPrompt(prompt.slug)}
                  className="group bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:border-purple-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-gray-900 mb-1 truncate group-hover:text-purple-600 transition-colors">
                        {prompt.title}
                      </h4>
                      <span className="text-xs text-gray-500 font-medium">{prompt.category_icon} {prompt.category_name}</span>
                    </div>
                    {user && (
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(prompt.id); }}
                        className="flex-shrink-0 transition-transform hover:scale-110"
                      >
                        <Heart size={20} fill={isFav(prompt.id) ? '#EF4444' : 'none'} color={isFav(prompt.id) ? '#EF4444' : '#D1D5DB'} />
                      </button>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">{prompt.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Eye size={14} />
                      {prompt.view_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star size={14} />
                      {prompt.avg_rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full text-center py-20">
                  <p className="text-lg text-gray-400">{t.noResults}</p>
                </div>
              )}
            </div>
          </>
        )}

        {view === 'detail' && selectedPrompt && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
              <div className="mb-8">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{selectedPrompt.title}</h2>
                    <span className="text-sm text-gray-500 font-medium">{selectedPrompt.category_icon} {selectedPrompt.category_name}</span>
                  </div>
                  {user && (
                    <button
                      onClick={() => toggleFavorite(selectedPrompt.id)}
                      className="flex-shrink-0 hover:scale-110 transition-transform"
                    >
                      <Heart size={24} fill={isFav(selectedPrompt.id) ? '#EF4444' : 'none'} color={isFav(selectedPrompt.id) ? '#EF4444' : '#D1D5DB'} />
                    </button>
                  )}
                </div>

                <p className="text-gray-600 text-base mb-6">{selectedPrompt.description}</p>

                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                    <Eye size={16} />
                    {selectedPrompt.view_count}
                  </span>
                  <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                    <Star size={16} />
                    {selectedPrompt.avg_rating.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{t.content}</h3>
                  <button
                    onClick={copyContent}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium hover:shadow-lg transition-all"
                  >
                    {copyText ? <Check size={16} /> : <Copy size={16} />}
                    {copyText || t.copy}
                  </button>
                </div>
                <pre className="bg-gray-50 p-5 rounded-xl border border-gray-200 text-sm leading-relaxed whitespace-pre-wrap font-mono overflow-x-auto">
                  {selectedPrompt.content}
                </pre>
              </div>

              {/* Examples */}
              {selectedPrompt.examples && selectedPrompt.examples.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.examples}</h3>
                  <div className="space-y-4">
                    {selectedPrompt.examples.map((ex, i) => (
                      <div key={i} className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                        <div className="mb-3">
                          <p className="text-xs font-semibold text-purple-600 mb-1.5">{t.input}</p>
                          <p className="text-sm text-gray-800">{ex.input}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-pink-600 mb-1.5">{t.output}</p>
                          <p className="text-sm text-gray-800 whitespace-pre-wrap">{ex.output}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {authView === 'login' ? t.login : t.register}
              </h2>
              <button onClick={() => setShowAuth(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.username}</label>
                <input
                  type="text"
                  required
                  value={authForm.username}
                  onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.password}</label>
                <input
                  type="password"
                  required
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium hover:shadow-lg transition-all"
              >
                {t.submit}
              </button>
              <button
                type="button"
                onClick={() => setAuthView(authView === 'login' ? 'register' : 'login')}
                className="w-full text-purple-600 font-medium text-sm hover:text-purple-700"
              >
                {authView === 'login' ? t.register : t.login}
              </button>
            </form>
          </div>
        </div>
      )}

      <footer className="mt-16 py-8 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <Sparkles size={16} className="text-purple-500" />
            PromptHub © 2026
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
