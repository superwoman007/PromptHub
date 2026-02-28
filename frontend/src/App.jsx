import { useState, useEffect } from 'react';
import { Search, ArrowLeft, Copy, Check, Heart, Sparkles, X, Eye, LogOut, User, Star, Upload, MessageSquare, Send } from 'lucide-react';
import './index.css';

const i18n = {
  zh: {
    title: 'PromptHub',
    subtitle: '发现优质 AI 提示词',
    desc: '开源社区，分享创意提示词，让 AI 更懂你',
    searchPlaceholder: '���索提示词...',
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
    upload: '上传提示词',
    myCenter: '个人中心',
    myUploads: '我的上传',
    myFavorites: '我的收藏',
    rateThis: '评价这个提示词',
    yourRating: '你的评分',
    yourComment: '你的评论（可选）',
    submitReview: '提交评价',
    reviews: '用户评价',
    noReviews: '暂无评价',
    uploadTitle: '标题',
    uploadDesc: '描述',
    uploadContent: '提示词内容',
    uploadCategory: '分类',
    uploadExamples: '使用示例（可选）',
    addExample: '添加示例',
    exampleInput: '示例输入',
    exampleOutput: '示例输出',
    cancel: '取消',
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
    upload: 'Upload Prompt',
    myCenter: 'My Center',
    myUploads: 'My Uploads',
    myFavorites: 'My Favorites',
    rateThis: 'Rate this prompt',
    yourRating: 'Your rating',
    yourComment: 'Your comment (optional)',
    submitReview: 'Submit Review',
    reviews: 'Reviews',
    noReviews: 'No reviews yet',
    uploadTitle: 'Title',
    uploadDesc: 'Description',
    uploadContent: 'Prompt Content',
    uploadCategory: 'Category',
    uploadExamples: 'Examples (optional)',
    addExample: 'Add Example',
    exampleInput: 'Example Input',
    exampleOutput: 'Example Output',
    cancel: 'Cancel',
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
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: '', description: '', content: '', category_id: '', examples: [] });
  const [myUploads, setMyUploads] = useState([]);
  const [centerTab, setCenterTab] = useState('uploads');
  const t = i18n[lang];

  useEffect(() => {
    fetchData();
    const token = localStorage.getItem('ph_token');
    const u = localStorage.getItem('ph_user');
    if (token && u) { 
      setUser(JSON.parse(u)); 
      fetchFavorites(token);
      fetchMyUploads(token);
    }
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

  const fetchMyUploads = async (token) => {
    try {
      const r = await fetch('http://localhost:3001/api/my/prompts', { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) setMyUploads(await r.json());
    } catch (e) { console.error(e); }
  };

  const fetchReviews = async (promptId) => {
    try {
      const r = await fetch(`http://localhost:3001/api/reviews/${promptId}`);
      if (r.ok) setReviews(await r.json());
    } catch (e) { console.error(e); }
  };

  const viewPrompt = async (slug) => {
    const r = await fetch(`http://localhost:3001/api/prompts/${slug}`);
    const prompt = await r.json();
    setSelectedPrompt(prompt);
    fetchReviews(prompt.id);
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
      fetchMyUploads(d.token);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ph_token');
    localStorage.removeItem('ph_user');
    setUser(null);
    setFavorites([]);
    setMyUploads([]);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) { setShowAuth(true); return; }
    const token = localStorage.getItem('ph_token');
    const r = await fetch(`http://localhost:3001/api/reviews/${selectedPrompt.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(reviewForm)
    });
    if (r.ok) {
      setReviewForm({ rating: 5, comment: '' });
      fetchReviews(selectedPrompt.id);
      // Refresh prompt to update avg rating
      const pr = await fetch(`http://localhost:3001/api/prompts/${selectedPrompt.slug}`);
      setSelectedPrompt(await pr.json());
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!user) { setShowAuth(true); return; }
    const token = localStorage.getItem('ph_token');
    const r = await fetch('http://localhost:3001/api/prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(uploadForm)
    });
    if (r.ok) {
      setShowUpload(false);
      setUploadForm({ title: '', description: '', content: '', category_id: '', examples: [] });
      fetchData();
      fetchMyUploads(token);
    }
  };

  const addExample = () => {
    setUploadForm({ ...uploadForm, examples: [...uploadForm.examples, { input: '', output: '' }] });
  };

  const updateExample = (index, field, value) => {
    const newExamples = [...uploadForm.examples];
    newExamples[index][field] = value;
    setUploadForm({ ...uploadForm, examples: newExamples });
  };

  const removeExample = (index) => {
    setUploadForm({ ...uploadForm, examples: uploadForm.examples.filter((_, i) => i !== index) });
  };

  const filtered = prompts.filter(p => {
    const ms = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const mc = !selectedCategory || p.category_name === selectedCategory;
    return ms && mc;
  });

  const isFav = (id) => favorites.some(f => f.id === id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {view !== 'home' && (
                <button 
                  onClick={() => setView('home')} 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all"
                >
                  <ArrowLeft size={16} />
                  {t.back}
                </button>
              )}
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
                <Sparkles size={28} className="text-purple-600" />
                <h1 className="text-xl font-bold text-gray-900">{t.title}</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
                className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all"
              >
                {lang === 'zh' ? 'EN' : '中文'}
              </button>

              {user ? (
                <>
                  <button
                    onClick={() => setShowUpload(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all"
                  >
                    <Upload size={16} />
                    {t.upload}
                  </button>
                  <button
                    onClick={() => setView('center')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all"
                  >
                    <User size={16} />
                    {user.username}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all"
                  >
                    <LogOut size={16} />
                    {t.logout}
                  </button>
                </>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((prompt) => (
                <div
                  key={prompt.id}
                  onClick={() => viewPrompt(prompt.slug)}
                  className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:border-purple-500 hover:shadow-lg hover:-translate-y-1 transition-all"
                >
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <div className="flex-1">
                      <h4 className="text-base font-bold text-gray-900 mb-1">{prompt.title}</h4>
                      <span className="text-xs text-purple-600 font-medium">{prompt.category_icon} {prompt.category_name}</span>
                    </div>
                    {user && (
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(prompt.id); }}
                        className="transition-transform hover:scale-110"
                      >
                        <Heart size={20} fill={isFav(prompt.id) ? '#EF4444' : 'none'} color={isFav(prompt.id) ? '#EF4444' : '#D1D5DB'} />
                      </button>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">{prompt.description}</p>
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
                  <p className="text-xl text-gray-400">{t.noResults}</p>
                </div>
              )}
            </div>
          </>
        )}

        {view === 'detail' && selectedPrompt && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
              <div className="mb-6">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedPrompt.title}</h2>
                    <span className="text-purple-600 font-medium text-sm">{selectedPrompt.category_icon} {selectedPrompt.category_name}</span>
                  </div>
                  {user && (
                    <button
                      onClick={() => toggleFavorite(selectedPrompt.id)}
                      className="hover:scale-110 transition-transform"
                    >
                      <Heart size={24} fill={isFav(selectedPrompt.id) ? '#EF4444' : 'none'} color={isFav(selectedPrompt.id) ? '#EF4444' : '#D1D5DB'} />
                    </button>
                  )}
                </div>

                <p className="text-gray-600 mb-4">{selectedPrompt.description}</p>

                <div className="flex items-center gap-3 text-sm text-gray-500 mb-6">
                  <span className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                    <Eye size={14} />
                    {selectedPrompt.view_count} {t.views}
                  </span>
                  <span className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                    <Star size={14} />
                    {selectedPrompt.avg_rating.toFixed(1)} {t.rating}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{t.content}</h3>
                  <button
                    onClick={copyContent}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium hover:shadow-lg transition-all"
                  >
                    {copyText ? <Check size={16} /> : <Copy size={16} />}
                    {copyText || t.copy}
                  </button>
                </div>
                <pre className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                  {selectedPrompt.content}
                </pre>
              </div>

              {/* Examples */}
              {selectedPrompt.examples && selectedPrompt.examples.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{t.examples}</h3>
                  {selectedPrompt.examples.map((ex, i) => (
                    <div key={i} className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
                      <div className="mb-3">
                        <p className="text-xs font-bold text-purple-700 mb-1">{t.input}:</p>
                        <p className="text-sm text-gray-800">{ex.input}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-purple-700 mb-1">{t.output}:</p>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{ex.output}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare size={20} />
                {t.reviews}
              </h3>

              {/* Review Form */}
              {user && (
                <form onSubmit={handleReviewSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-3">{t.rateThis}</p>
                  <div className="flex items-center gap-2 mb-3">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className="transition-transform hover:scale-110"
                      >
                        <Star size={24} fill={star <= reviewForm.rating ? '#FBBF24' : 'none'} color={star <= reviewForm.rating ? '#FBBF24' : '#D1D5DB'} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    placeholder={t.yourComment}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3"
                    rows="3"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium hover:shadow-lg transition-all"
                  >
                    <Send size={16} />
                    {t.submitReview}
                  </button>
                </form>
              )}

              {/* Reviews List */}
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map(review => (
                    <div key={review.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{review.username}</span>
                        <div className="flex items-center gap-1">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} size={14} fill="#FBBF24" color="#FBBF24" />
                          ))}
                        </div>
                      </div>
                      {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
                      <p className="text-xs text-gray-400 mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">{t.noReviews}</p>
              )}
            </div>
          </div>
        )}

        {view === 'center' && user && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.myCenter}</h2>
              
              {/* Tabs */}
              <div className="flex gap-2 mb-6 border-b border-gray-200">
                <button
                  onClick={() => setCenterTab('uploads')}
                  className={`px-4 py-2 text-sm font-medium transition-all ${centerTab === 'uploads' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  {t.myUploads} ({myUploads.length})
                </button>
                <button
                  onClick={() => setCenterTab('favorites')}
                  className={`px-4 py-2 text-sm font-medium transition-all ${centerTab === 'favorites' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  {t.myFavorites} ({favorites.length})
                </button>
              </div>

              {/* Content */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {centerTab === 'uploads' && myUploads.map(prompt => (
                  <div
                    key={prompt.id}
                    onClick={() => viewPrompt(prompt.slug)}
                    className="bg-gray-50 rounded-lg border border-gray-200 p-4 cursor-pointer hover:border-purple-500 hover:shadow-md transition-all"
                  >
                    <h4 className="text-base font-bold text-gray-900 mb-1">{prompt.title}</h4>
                    <span className="text-xs text-purple-600 font-medium mb-2 block">{prompt.category_icon} {prompt.category_name}</span>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-2">{prompt.description}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Eye size={12} />{prompt.view_count}</span>
                      <span className="flex items-center gap-1"><Star size={12} />{prompt.avg_rating.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
                {centerTab === 'favorites' && favorites.map(prompt => (
                  <div
                    key={prompt.id}
                    onClick={() => viewPrompt(prompt.slug)}
                    className="bg-gray-50 rounded-lg border border-gray-200 p-4 cursor-pointer hover:border-purple-500 hover:shadow-md transition-all"
                  >
                    <h4 className="text-base font-bold text-gray-900 mb-1">{prompt.title}</h4>
                    <span className="text-xs text-purple-600 font-medium mb-2 block">{prompt.category_icon} {prompt.category_name}</span>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-2">{prompt.description}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Eye size={12} />{prompt.view_count}</span>
                      <span className="flex items-center gap-1"><Star size={12} />{prompt.avg_rating.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {centerTab === 'uploads' && myUploads.length === 0 && (
                <p className="text-gray-400 text-center py-12">{t.noResults}</p>
              )}
              {centerTab === 'favorites' && favorites.length === 0 && (
                <p className="text-gray-400 text-center py-12">{t.noResults}</p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-2xl my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{t.upload}</h2>
              <button onClick={() => setShowUpload(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.uploadTitle}</label>
                <input
                  type="text"
                  required
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.uploadDesc}</label>
                <textarea
                  required
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.uploadContent}</label>
                <textarea
                  required
                  value={uploadForm.content}
                  onChange={(e) => setUploadForm({ ...uploadForm, content: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                  rows="8"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.uploadCategory}</label>
                <select
                  value={uploadForm.category_id}
                  onChange={(e) => setUploadForm({ ...uploadForm, category_id: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">选择分类</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.uploadExamples}</label>
                {uploadForm.examples.map((ex, i) => (
                  <div key={i} className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <input
                      type="text"
                      placeholder={t.exampleInput}
                      value={ex.input}
                      onChange={(e) => updateExample(i, 'input', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
                    />
                    <textarea
                      placeholder={t.exampleOutput}
                      value={ex.output}
                      onChange={(e) => updateExample(i, 'output', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows="2"
                    />
                    <button
                      type="button"
                      onClick={() => removeExample(i)}
                      className="mt-2 text-xs text-red-600 hover:text-red-700"
                    >
                      删除示例
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addExample}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  + {t.addExample}
                </button>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium hover:shadow-lg transition-all"
                >
                  {t.submit}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUpload(false)}
                  className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition-all"
                >
                  {t.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {authView === 'login' ? t.login : t.register}
              </h2>
              <button onClick={() => setShowAuth(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.username}</label>
                <input
                  type="text"
                  required
                  value={authForm.username}
                  onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.password}</label>
                <input
                  type="password"
                  required
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium hover:shadow-lg transition-all"
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

      <footer className="mt-16 py-8 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
            <Sparkles size={16} className="text-purple-600" />
            PromptHub © 2026 — Open Source AI Prompt Community
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
