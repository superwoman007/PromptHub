import { useState, useEffect } from 'react';
import { Search, ArrowLeft, Copy, Check, Heart, Sparkles, Menu, X, TrendingUp, Star, Eye, LogOut, User } from 'lucide-react';
import './index.css';

const i18n = {
  zh: {
    title: 'PromptHub',
    subtitle: '发现 & 分享',
    subtitle2: '高质量 AI 提示词',
    desc: '一个开源的 AI 提示词社区，发现、创建、分享创意提示词，让 AI 更好地为你工作',
    searchPlaceholder: '搜索标签或提示词内容...',
    trending: '全部',
    views: '浏览',
    rating: '评分',
    back: '返回',
    examples: '使用示例',
    content: '提示词内容',
    copy: '复制',
    copied: '已复制',
    categories: '分类浏览',
    noResults: '暂无匹配的提示词',
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
    subtitle: 'Discover & Share',
    subtitle2: 'AI-Powered Prompts',
    desc: 'An open-source AI prompting tool for the modern world to discover, create and share creative prompts',
    searchPlaceholder: 'Search for a tag or a prompt...',
    trending: 'All',
    views: 'Views',
    rating: 'Rating',
    back: 'Back',
    examples: 'Examples',
    content: 'Prompt Content',
    copy: 'Copy',
    copied: 'Copied',
    categories: 'Browse by Category',
    noResults: 'No matching prompts found',
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
    <div className="min-h-screen bg-[#FAF5FF]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#FAF5FF]/80 backdrop-blur-xl border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {view === 'detail' && (
                <button 
                  onClick={() => setView('home')} 
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-purple-200 text-purple-800 font-medium hover:bg-purple-50 transition-all duration-200 cursor-pointer"
                >
                  <ArrowLeft size={18} />
                  {t.back}
                </button>
              )}
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
                <Sparkles size={32} className="text-[#7C3AED]" />
                <h1 className="text-2xl font-extrabold text-[#4C1D95] tracking-tight">{t.title}</h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
                className="px-4 py-2 rounded-full bg-white border border-purple-200 text-purple-800 font-medium hover:bg-purple-50 transition-all duration-200"
              >
                {lang === 'zh' ? 'EN' : '中文'}
              </button>

              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-purple-800 font-medium">
                    <User size={20} />
                    {user.username}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                  >
                    <LogOut size={18} />
                    {t.logout}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="px-5 py-2.5 rounded-full bg-[#22C55E] text-white font-bold hover:bg-[#16A34A] transition-all duration-200 hover:shadow-lg"
                >
                  {t.login}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {view === 'home' && (
          <>
            {/* Hero */}
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-extrabold text-[#4C1D95] mb-4 leading-tight">
                {t.subtitle}
              </h2>
              <h3 className="text-5xl sm:text-6xl font-black mb-6">
                <span className="bg-gradient-to-r from-[#7C3AED] via-[#A78BFA] to-[#7C3AED] bg-clip-text text-transparent">
                  {t.subtitle2}
                </span>
              </h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t.desc}</p>
            </div>

            {/* Search */}
            <div className="mb-12 max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-14 pr-5 py-4 bg-white border border-purple-200 rounded-2xl text-base focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-[#7C3AED] transition-all duration-200 shadow-lg"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="mb-12">
              <h3 className="text-xl font-bold text-[#4C1D95] mb-5 flex items-center gap-2">
                <TrendingUp size={24} />
                {t.categories}
              </h3>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-5 py-3 rounded-full font-semibold transition-all duration-200 cursor-pointer ${!selectedCategory ? 'bg-[#7C3AED] text-white shadow-lg' : 'bg-white border border-purple-200 text-purple-800 hover:bg-purple-50'}`}
                >
                  {t.trending}
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                    className={`px-5 py-3 rounded-full font-semibold transition-all duration-200 cursor-pointer ${selectedCategory === cat.name ? 'bg-[#7C3AED] text-white shadow-lg' : 'bg-white border border-purple-200 text-purple-800 hover:bg-purple-50'}`}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((prompt, idx) => (
                <div
                  key={prompt.id}
                  onClick={() => viewPrompt(prompt.slug)}
                  className="bg-white rounded-[20px] border border-gray-200 p-6 cursor-pointer hover:border-[#7C3AED] hover:shadow-xl hover:shadow-purple-100 hover:-translate-y-1 transition-all duration-300"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 mb-1">{prompt.title}</h4>
                      <span className="text-sm text-purple-700 font-medium">{prompt.category_icon} {prompt.category_name}</span>
                    </div>
                    {user && (
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(prompt.id); }}
                        className="text-xl transition-transform hover:scale-110 cursor-pointer"
                      >
                        <Heart size={24} fill={isFav(prompt.id) ? '#EF4444' : 'none'} color={isFav(prompt.id) ? '#EF4444' : '#D1D5DB'} />
                      </button>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">{prompt.description}</p>
                  <div className="flex items-center gap-5 text-sm text-gray-400 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Eye size={16} />
                      {prompt.view_count}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Star size={16} />
                      {prompt.avg_rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full text-center py-20">
                  <p className="text-xl text-gray-400">{t.noResults}</p>
                </div>
              )}
            </div>
          </>
        )}

        {view === 'detail' && selectedPrompt && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-[20px] border border-gray-200 p-8 shadow-lg">
              <div className="mb-8">
                <div className="flex justify-between items-start gap-6 mb-6">
                  <div>
                    <h2 className="text-3xl font-extrabold text-[#4C1D95] mb-2">{selectedPrompt.title}</h2>
                    <span className="text-purple-700 font-medium">{selectedPrompt.category_icon} {selectedPrompt.category_name}</span>
                  </div>
                  {user && (
                    <button
                      onClick={() => toggleFavorite(selectedPrompt.id)}
                      className="text-2xl hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Heart size={28} fill={isFav(selectedPrompt.id) ? '#EF4444' : 'none'} color={isFav(selectedPrompt.id) ? '#EF4444' : '#D1D5DB'} />
                    </button>
                  )}
                </div>

                <p className="text-gray-600 text-lg mb-6">{selectedPrompt.description}</p>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-8">
                  <span className="flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-full">
                    <Eye size={16} />
                    {selectedPrompt.view_count} {t.views}
                  </span>
                  <span className="flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-full">
                    <Star size={16} />
                    {selectedPrompt.avg_rating.toFixed(1)} {t.rating}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="mb-10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles size={24} className="text-[#7C3AED]" />
                    {t.content}
                  </h3>
                  <button
                    onClick={copyContent}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#7C3AED] text-white font-semibold hover:bg-[#5B21B6] transition-all duration-200 cursor-pointer"
                  >
                    {copyText ? <Check size={18} /> : <Copy size={18} />}
                    {copyText || t.copy}
                  </button>
                </div>
                <pre className="bg-gray-50 p-6 rounded-[20px] border border-gray-200 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                  {selectedPrompt.content}
                </pre>
              </div>

              {/* Examples */}
              {selectedPrompt.examples && selectedPrompt.examples.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <Sparkles size={24} className="text-[#7C3AED]" />
                    {t.examples}
                  </h3>
                  {selectedPrompt.examples.map((ex, i) => (
                    <div key={i} className="mb-5 p-6 bg-purple-50 rounded-[20px] border border-purple-100">
                      <div className="mb-4">
                        <p className="text-sm font-bold text-[#7C3AED] mb-2">{t.input}:</p>
                        <p className="text-sm text-gray-800">{ex.input}</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#5B21B6] mb-2">{t.output}:</p>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{ex.output}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[20px] p-8 max-w-sm w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-extrabold text-[#4C1D95]">
                {authView === 'login' ? t.login : t.register}
              </h2>
              <button onClick={() => setShowAuth(false)} className="text-gray-400 hover:text-gray-600 text-xl cursor-pointer">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAuth} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t.username}</label>
                <input
                  type="text"
                  required
                  value={authForm.username}
                  onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-[#7C3AED] transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t.password}</label>
                <input
                  type="password"
                  required
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-[#7C3AED] transition-all duration-200"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#22C55E] text-white font-bold text-base hover:bg-[#16A34A] transition-all duration-200 cursor-pointer"
              >
                {t.submit}
              </button>
              <button
                type="button"
                onClick={() => setAuthView(authView === 'login' ? 'register' : 'login')}
                className="w-full text-[#7C3AED] font-semibold text-base hover:text-[#5B21B6] cursor-pointer"
              >
                {authView === 'login' ? t.register : t.login}
              </button>
            </form>
          </div>
        </div>
      )}

      <footer className="mt-20 py-10 border-t border-purple-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-500 font-medium flex items-center justify-center gap-2">
            <Sparkles size={20} className="text-[#7C3AED]" />
            PromptHub © 2026 — Open Source AI Prompt Community
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
