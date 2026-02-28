import { useState, useEffect } from 'react';
import { Search, ArrowLeft, Copy, Check, Heart, Sparkles, X, Eye, LogOut, User, Star, Upload, MessageSquare, Send, Moon, Sun } from 'lucide-react';
import './index.css';

const i18n = {
  zh: {
    title: 'PromptHub',
    subtitle: '发现并分享优质 AI 提示词',
    desc: '开源社区驱动的提示词分享平台',
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
    logout: '��出',
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
    browsePrompts: '浏览提示词',
    uploadPrompt: '发布提示词',
    highlighted: '精选',
    popular: '热门',
    highlightedDesc: '社区精选的优质提示词',
    popularDesc: '最受欢迎的提示词',
  },
  en: {
    title: 'PromptHub',
    subtitle: 'Discover and Share Quality AI Prompts',
    desc: 'Open-source community-driven prompt sharing platform',
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
    browsePrompts: 'Browse Prompts',
    uploadPrompt: 'Publish Prompt',
    highlighted: 'Highlighted',
    popular: 'Popular',
    highlightedDesc: 'Community-curated quality prompts',
    popularDesc: 'Most popular prompts',
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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    content: '',
    category_id: '',
    examples: [],
  });
  const [theme, setTheme] = useState('light');

  const t = i18n[lang];

  useEffect(() => {
    fetchPrompts();
    fetchCategories();
  }, []);

  const fetchPrompts = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/prompts');
      const data = await res.json();
      setPrompts(data);
    } catch (err) {
      console.error('Failed to fetch prompts:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopyText(text);
    setTimeout(() => setCopyText(''), 2000);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    try {
      const res = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm),
      });
      const data = await res.json();
      if (data.token) {
        setUser({ ...data.user, token: data.token });
        setShowAuthModal(false);
        setAuthForm({ username: '', password: '' });
      }
    } catch (err) {
      console.error('Auth failed:', err);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('home');
  };

  const viewPrompt = async (slug) => {
    try {
      const res = await fetch(`http://localhost:3001/api/prompts/${slug}`);
      const data = await res.json();
      setSelectedPrompt(data);
      setView('detail');
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Failed to fetch prompt:', err);
    }
  };

  const handleRatingSubmit = async () => {
    if (!user || !selectedPrompt || userRating === 0) return;
    try {
      await fetch('http://localhost:3001/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          prompt_id: selectedPrompt.id,
          rating: userRating,
          comment: userComment,
        }),
      });
      setUserRating(0);
      setUserComment('');
      const res = await fetch(`http://localhost:3001/api/prompts/${selectedPrompt.id}`);
      const updated = await res.json();
      setSelectedPrompt(updated);
    } catch (err) {
      console.error('Failed to submit rating:', err);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      await fetch('http://localhost:3001/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify(uploadForm),
      });
      setUploadForm({
        title: '',
        description: '',
        content: '',
        category_id: '',
        examples: [],
      });
      setView('home');
      fetchPrompts();
    } catch (err) {
      console.error('Failed to upload prompt:', err);
    }
  };

  const addExample = () => {
    setUploadForm({
      ...uploadForm,
      examples: [...uploadForm.examples, { input: '', output: '' }],
    });
  };

  const updateExample = (index, field, value) => {
    const newExamples = [...uploadForm.examples];
    newExamples[index][field] = value;
    setUploadForm({ ...uploadForm, examples: newExamples });
  };

  const removeExample = (index) => {
    setUploadForm({
      ...uploadForm,
      examples: uploadForm.examples.filter((_, i) => i !== index),
    });
  };

  const filteredPrompts = prompts.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !selectedCategory || p.category_id === selectedCategory;
    return matchSearch && matchCategory;
  });

  const highlightedPrompts = filteredPrompts.filter(p => p.avg_rating >= 4.5).slice(0, 6);
  const popularPrompts = filteredPrompts.sort((a, b) => b.views - a.views).slice(0, 6);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Navigation Bar Component (ClawHub style)
  const NavBar = () => (
    <nav className="nav-bar">
      <div className="nav-container">
        <div className="nav-left">
          <div className="nav-logo" onClick={() => setView('home')}>
            <Sparkles size={24} />
            <span>{t.title}</span>
          </div>
          <div className="nav-links">
            <button onClick={() => setView('home')} className={view === 'home' ? 'active' : ''}>
              {t.browsePrompts}
            </button>
            {user && (
              <>
                <button onClick={() => setView('upload')} className={view === 'upload' ? 'active' : ''}>
                  {t.upload}
                </button>
                <button onClick={() => setView('center')} className={view === 'center' ? 'active' : ''}>
                  {t.myCenter}
                </button>
              </>
            )}
          </div>
        </div>
        <div className="nav-right">
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button className="lang-toggle" onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}>
            {lang === 'zh' ? 'EN' : '中'}
          </button>
          {user ? (
            <button className="nav-user" onClick={handleLogout}>
              <User size={18} />
              <span>{user.username}</span>
              <LogOut size={16} />
            </button>
          ) : (
            <button className="nav-login" onClick={() => { setShowAuthModal(true); setAuthMode('login'); }}>
              {t.login}
            </button>
          )}
        </div>
      </div>
    </nav>
  );

  // Hero Section (ClawHub style)
  const Hero = () => (
    <div className="hero">
      <div className="hero-content">
        <h1 className="hero-title">{t.subtitle}</h1>
        <p className="hero-desc">{t.desc}</p>
        <div className="hero-actions">
          {user && (
            <button className="btn-primary" onClick={() => setView('upload')}>
              <Upload size={20} />
              {t.uploadPrompt}
            </button>
          )}
          <button className="btn-secondary" onClick={() => setView('home')}>
            {t.browsePrompts}
          </button>
        </div>
      </div>
    </div>
  );

  // Prompt Card Component (ClawHub style)
  const PromptCard = ({ prompt, highlighted }) => (
    <div className="prompt-card" onClick={() => viewPrompt(prompt.slug)}>
      {highlighted && <span className="card-badge">{t.highlighted}</span>}
      <div className="card-header">
        <span className="card-icon">{prompt.category_icon}</span>
        <span className="card-category">{prompt.category_name}</span>
      </div>
      <h3 className="card-title">{prompt.title}</h3>
      <p className="card-desc">{prompt.description}</p>
      <div className="card-footer">
        <div className="card-stats">
          <span><Eye size={14} /> {prompt.views}</span>
          <span><Star size={14} /> {prompt.avg_rating?.toFixed(1) || 'N/A'}</span>
        </div>
      </div>
    </div>
  );

  // Home View
  const HomeView = () => (
    <div className="home-view">
      <Hero />
      
      {/* Search Bar */}
      <div className="search-section">
        <div className="search-container">
          <Search size={20} />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="category-filters">
          <button
            className={!selectedCategory ? 'active' : ''}
            onClick={() => setSelectedCategory(null)}
          >
            {t.all}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={selectedCategory === cat.id ? 'active' : ''}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Highlighted Section */}
      {highlightedPrompts.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h2>{t.highlighted}</h2>
            <p>{t.highlightedDesc}</p>
          </div>
          <div className="prompt-grid">
            {highlightedPrompts.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} highlighted />
            ))}
          </div>
        </div>
      )}

      {/* Popular Section */}
      <div className="section">
        <div className="section-header">
          <h2>{t.popular}</h2>
          <p>{t.popularDesc}</p>
        </div>
        <div className="prompt-grid">
          {popularPrompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      </div>

      {/* All Prompts */}
      {filteredPrompts.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h2>{t.all}</h2>
          </div>
          <div className="prompt-grid">
            {filteredPrompts.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        </div>
      )}

      {filteredPrompts.length === 0 && (
        <div className="empty-state">
          <p>{t.noResults}</p>
        </div>
      )}
    </div>
  );

  // Detail View
  const DetailView = () => {
    if (!selectedPrompt) return null;

    return (
      <div className="detail-view">
        <button className="back-btn" onClick={() => setView('home')}>
          <ArrowLeft size={20} />
          {t.back}
        </button>

        <div className="detail-container">
          <div className="detail-header">
            <div className="detail-title-row">
              <span className="detail-icon">{selectedPrompt.category_icon}</span>
              <h1>{selectedPrompt.title}</h1>
            </div>
            <p className="detail-desc">{selectedPrompt.description}</p>
            <div className="detail-meta">
              <span><Eye size={16} /> {selectedPrompt.views} {t.views}</span>
              <span><Star size={16} /> {selectedPrompt.avg_rating?.toFixed(1) || 'N/A'} {t.rating}</span>
              <span><MessageSquare size={16} /> {selectedPrompt.ratings?.length || 0} {t.reviews}</span>
            </div>
          </div>

          <div className="detail-content">
            <h3>{t.content}</h3>
            <div className="content-box">
              <pre>{selectedPrompt.content}</pre>
              <button
                className="copy-btn"
                onClick={() => handleCopy(selectedPrompt.content)}
              >
                {copyText === selectedPrompt.content ? <Check size={18} /> : <Copy size={18} />}
                {copyText === selectedPrompt.content ? t.copied : t.copy}
              </button>
            </div>
          </div>

          {selectedPrompt.examples && selectedPrompt.examples.length > 0 && (
            <div className="detail-examples">
              <h3>{t.examples}</h3>
              {selectedPrompt.examples.map((ex, i) => (
                <div key={i} className="example-item">
                  <div className="example-block">
                    <strong>{t.input}:</strong>
                    <p>{ex.input}</p>
                  </div>
                  <div className="example-block">
                    <strong>{t.output}:</strong>
                    <p>{ex.output}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Rating Section */}
          {user && (
            <div className="rating-section">
              <h3>{t.rateThis}</h3>
              <div className="rating-form">
                <div className="star-rating">
                  <span>{t.yourRating}:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={24}
                      fill={star <= userRating ? '#fbbf24' : 'none'}
                      stroke={star <= userRating ? '#fbbf24' : '#d1d5db'}
                      onClick={() => setUserRating(star)}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </div>
                <textarea
                  placeholder={t.yourComment}
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  className="comment-input"
                />
                <button
                  className="btn-primary"
                  onClick={handleRatingSubmit}
                  disabled={userRating === 0}
                >
                  <Send size={18} />
                  {t.submitReview}
                </button>
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div className="reviews-section">
            <h3>{t.reviews}</h3>
            {selectedPrompt.ratings && selectedPrompt.ratings.length > 0 ? (
              <div className="reviews-list">
                {selectedPrompt.ratings.map((rating) => (
                  <div key={rating.id} className="review-item">
                    <div className="review-header">
                      <span className="review-author">{rating.username}</span>
                      <div className="review-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            fill={star <= rating.rating ? '#fbbf24' : 'none'}
                            stroke={star <= rating.rating ? '#fbbf24' : '#d1d5db'}
                          />
                        ))}
                      </div>
                    </div>
                    {rating.comment && <p className="review-comment">{rating.comment}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-reviews">{t.noReviews}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Upload View
  const UploadView = () => (
    <div className="upload-view">
      <h2>{t.upload}</h2>
      <form onSubmit={handleUploadSubmit} className="upload-form">
        <div className="form-group">
          <label>{t.uploadTitle}</label>
          <input
            type="text"
            value={uploadForm.title}
            onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>{t.uploadDesc}</label>
          <textarea
            value={uploadForm.description}
            onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>{t.uploadContent}</label>
          <textarea
            value={uploadForm.content}
            onChange={(e) => setUploadForm({ ...uploadForm, content: e.target.value })}
            required
            rows={8}
          />
        </div>
        <div className="form-group">
          <label>{t.uploadCategory}</label>
          <select
            value={uploadForm.category_id}
            onChange={(e) => setUploadForm({ ...uploadForm, category_id: e.target.value })}
            required
          >
            <option value="">{t.uploadCategory}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>{t.uploadExamples}</label>
          {uploadForm.examples.map((ex, i) => (
            <div key={i} className="example-form">
              <input
                type="text"
                placeholder={t.exampleInput}
                value={ex.input}
                onChange={(e) => updateExample(i, 'input', e.target.value)}
              />
              <textarea
                placeholder={t.exampleOutput}
                value={ex.output}
                onChange={(e) => updateExample(i, 'output', e.target.value)}
              />
              <button type="button" onClick={() => removeExample(i)} className="btn-remove">
                <X size={18} />
              </button>
            </div>
          ))}
          <button type="button" onClick={addExample} className="btn-secondary">
            {t.addExample}
          </button>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-primary">{t.submit}</button>
          <button type="button" onClick={() => setView('home')} className="btn-secondary">{t.cancel}</button>
        </div>
      </form>
    </div>
  );

  // User Center View
  const UserCenterView = () => {
    const myPrompts = prompts.filter(p => p.author_id === user?.id);
    return (
      <div className="center-view">
        <h2>{t.myCenter}</h2>
        <div className="center-section">
          <h3>{t.myUploads}</h3>
          <div className="prompt-grid">
            {myPrompts.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Auth Modal
  const AuthModal = () => (
    <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setShowAuthModal(false)}>
          <X size={24} />
        </button>
        <h2>{authMode === 'login' ? t.login : t.register}</h2>
        <form onSubmit={handleAuth} className="auth-form">
          <input
            type="text"
            placeholder={t.username}
            value={authForm.username}
            onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder={t.password}
            value={authForm.password}
            onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
            required
          />
          <button type="submit" className="btn-primary">{t.submit}</button>
        </form>
        <p className="auth-switch">
          {authMode === 'login' ? (
            <span onClick={() => setAuthMode('register')}>{t.register}</span>
          ) : (
            <span onClick={() => setAuthMode('login')}>{t.login}</span>
          )}
        </p>
      </div>
    </div>
  );

  return (
    <div className={`app ${theme}`}>
      <NavBar />
      <main className="main-content">
        {view === 'home' && <HomeView />}
        {view === 'detail' && <DetailView />}
        {view === 'upload' && <UploadView />}
        {view === 'center' && <UserCenterView />}
      </main>
      {showAuthModal && <AuthModal />}
    </div>
  );
}

export default App;
