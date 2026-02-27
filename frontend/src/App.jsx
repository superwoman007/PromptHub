import { useState, useEffect } from 'react';
import './App.css';

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
    back: '← 返回',
    examples: '💡 使用示例',
    content: '📝 提示词内容',
    copy: '📋 复制',
    copied: '✅ 已复制！',
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
    back: '← Back',
    examples: '💡 Examples',
    content: '📝 Prompt Content',
    copy: '📋 Copy',
    copied: '✅ Copied!',
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
    <>
      <div className="main"><div className="gradient-bg" /></div>

      <div className="relative z-10 min-h-screen">
        {/* Nav */}
        <nav className="flex justify-between items-center w-full px-6 sm:px-16 py-5 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}>
            <span className="text-3xl">🚀</span>
            <span className="font-bold text-xl tracking-wide text-gray-900">{t.title}</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} className="rounded-full border border-gray-300 bg-white py-1.5 px-4 text-sm font-medium hover:bg-gray-50 transition-all">
              🌐 {lang === 'zh' ? 'EN' : '中文'}
            </button>
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-700">👋 {user.username}</span>
                <button onClick={handleLogout} className="rounded-full border border-gray-900 bg-gray-900 py-1.5 px-5 text-white text-sm font-medium hover:bg-white hover:text-gray-900 transition-all">
                  {t.logout}
                </button>
              </div>
            ) : (
              <button onClick={() => setShowAuth(true)} className="rounded-full border border-gray-900 bg-gray-900 py-1.5 px-5 text-white text-sm font-medium hover:bg-white hover:text-gray-900 transition-all">
                {t.login}
              </button>
            )}
          </div>
        </nav>

        {/* Main */}
        <div className="flex justify-center items-center flex-col max-w-7xl mx-auto sm:px-16 px-6">
          {view === 'home' && (
            <>
              {/* Hero */}
              <section className="w-full flex flex-col items-center mt-10">
                <h1 className="mt-5 text-5xl font-extrabold leading-[1.15] text-center sm:text-6xl">
                  {t.subtitle}
                  <br />
                  <span className="orange-gradient">{t.subtitle2}</span>
                </h1>
                <p className="mt-5 text-lg text-gray-600 sm:text-xl max-w-2xl text-center">{t.desc}</p>
              </section>

              {/* Search */}
              <div className="mt-16 w-full max-w-xl">
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="block w-full rounded-md border border-gray-200 bg-white py-2.5 pl-5 pr-12 text-sm shadow-lg font-medium focus:border-black focus:outline-none"
                />
              </div>

              {/* Categories */}
              <div className="mt-10 w-full">
                <h2 className="text-xl font-bold text-gray-800 mb-4">{t.categories}</h2>
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`rounded-full py-2 px-5 text-sm font-medium transition-all ${!selectedCategory ? 'border border-gray-900 bg-gray-900 text-white' : 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-900 hover:text-white'}`}
                  >
                    🔥 {t.trending}
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                      className={`rounded-full py-2 px-5 text-sm font-medium transition-all ${selectedCategory === cat.name ? 'border border-gray-900 bg-gray-900 text-white' : 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-900 hover:text-white'}`}
                    >
                      {cat.icon} {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt Cards */}
              <div className="mt-10 w-full columns-1 sm:columns-2 xl:columns-3 gap-6 space-y-6 py-8">
                {filtered.map(prompt => (
                  <div key={prompt.id} className="prompt-card cursor-pointer" onClick={() => viewPrompt(prompt.slug)}>
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg">{prompt.title}</h3>
                        <p className="mt-1 text-xs text-gray-500">{prompt.category_icon} {prompt.category_name}</p>
                      </div>
                      {user && (
                        <button onClick={(e) => { e.stopPropagation(); toggleFavorite(prompt.id); }} className="text-xl transition-transform hover:scale-125">
                          {isFav(prompt.id) ? '❤️' : '🤍'}
                        </button>
                      )}
                    </div>
                    <p className="mt-3 text-sm text-gray-600 line-clamp-3">{prompt.description}</p>
                    <div className="mt-4 flex items-center gap-4 text-xs text-gray-400 font-medium">
                      <span>👁️ {prompt.view_count}</span>
                      <span>⭐ {prompt.avg_rating.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
              {filtered.length === 0 && (
                <div className="w-full text-center py-20">
                  <p className="text-xl text-gray-400">{t.noResults}</p>
                </div>
              )}
            </>
          )}

          {view === 'detail' && selectedPrompt && (
            <div className="w-full max-w-3xl mt-10">
              <button onClick={() => setView('home')} className="rounded-full border border-gray-300 bg-white py-1.5 px-5 text-sm font-medium hover:bg-gray-50 transition-all mb-8">
                {t.back}
              </button>

              <div className="glassmorphism">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">{selectedPrompt.title}</h1>
                    <p className="mt-2 text-sm text-gray-500">{selectedPrompt.category_icon} {selectedPrompt.category_name}</p>
                  </div>
                  {user && (
                    <button onClick={() => toggleFavorite(selectedPrompt.id)} className="text-2xl hover:scale-125 transition-transform">
                      {isFav(selectedPrompt.id) ? '❤️' : '🤍'}
                    </button>
                  )}
                </div>

                <p className="text-gray-600 mb-6">{selectedPrompt.description}</p>

                <div className="flex gap-4 text-sm text-gray-500 mb-8">
                  <span className="bg-white/60 px-3 py-1 rounded-full">👁️ {selectedPrompt.view_count} {t.views}</span>
                  <span className="bg-white/60 px-3 py-1 rounded-full">⭐ {selectedPrompt.avg_rating.toFixed(1)} {t.rating}</span>
                </div>

                {/* Content */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-xl font-bold text-gray-900">{t.content}</h2>
                    <button onClick={copyContent} className="rounded-full border border-gray-900 bg-gray-900 py-1.5 px-5 text-white text-sm font-medium hover:bg-white hover:text-gray-900 transition-all">
                      {copyText || t.copy}
                    </button>
                  </div>
                  <pre className="bg-white/60 p-5 rounded-lg text-sm leading-relaxed whitespace-pre-wrap border border-gray-200 font-[Satoshi]">
                    {selectedPrompt.content}
                  </pre>
                </div>

                {/* Examples */}
                {selectedPrompt.examples && selectedPrompt.examples.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">{t.examples}</h2>
                    {selectedPrompt.examples.map((ex, i) => (
                      <div key={i} className="mb-4 p-5 bg-white/60 rounded-lg border border-gray-200">
                        <p className="text-xs font-bold text-orange-600 mb-1">{t.input}:</p>
                        <p className="text-sm text-gray-700 mb-3">{ex.input}</p>
                        <p className="text-xs font-bold text-blue-600 mb-1">{t.output}:</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{ex.output}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-20 py-8 text-center">
          <p className="text-sm text-gray-400 font-medium">🚀 PromptHub © 2026 — Open Source AI Prompt Community</p>
        </footer>
      </div>

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-extrabold text-gray-900">{authView === 'login' ? t.login : t.register}</h2>
              <button onClick={() => setShowAuth(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t.username}</label>
                <input type="text" required value={authForm.username} onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 py-2.5 px-4 text-sm focus:border-black focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t.password}</label>
                <input type="password" required value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 py-2.5 px-4 text-sm focus:border-black focus:outline-none" />
              </div>
              <button type="submit" className="w-full rounded-full bg-gray-900 py-2.5 text-white text-sm font-medium hover:bg-gray-800 transition-all">
                {t.submit}
              </button>
              <button type="button" onClick={() => setAuthView(authView === 'login' ? 'register' : 'login')}
                className="w-full text-sm text-orange-600 font-semibold hover:text-orange-700">
                {authView === 'login' ? t.register : t.login}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
