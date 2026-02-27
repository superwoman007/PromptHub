import { useState, useEffect } from 'react';
import './App.css';

const i18n = {
  zh: {
    title: 'PromptHub',
    subtitle: 'AI 提示词 Marketplace',
    searchPlaceholder: '搜索提示词...',
    trending: '全部',
    views: '浏览',
    downloads: '下载',
    rating: '评分',
    back: '返回',
    examples: '示例',
    content: '提示词内容',
    copy: '复制',
    copied: '已复制！',
    categories: '分类',
    noResults: '暂无结果',
    input: '输入',
    output: '输出',
  },
  en: {
    title: 'PromptHub',
    subtitle: 'AI Prompt Marketplace',
    searchPlaceholder: 'Search prompts...',
    trending: 'All',
    views: 'Views',
    downloads: 'Downloads',
    rating: 'Rating',
    back: 'Back',
    examples: 'Examples',
    content: 'Prompt Content',
    copy: 'Copy',
    copied: 'Copied!',
    categories: 'Categories',
    noResults: 'No results',
    input: 'Input',
    output: 'Output',
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
  const t = i18n[lang];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [catsRes, promptsRes] = await Promise.all([
        fetch('http://localhost:3001/api/categories'),
        fetch('http://localhost:3001/api/prompts'),
      ]);
      setCategories(await catsRes.json());
      setPrompts(await promptsRes.json());
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  const viewPrompt = async (slug) => {
    try {
      const res = await fetch(`http://localhost:3001/api/prompts/${slug}`);
      setSelectedPrompt(await res.json());
      setView('detail');
    } catch (err) {
      console.error('Failed to fetch prompt:', err);
    }
  };

  const copyContent = async () => {
    try {
      await navigator.clipboard.writeText(selectedPrompt.content);
      setCopyText(t.copied);
      setTimeout(() => setCopyText(''), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const filteredPrompts = prompts.filter(p => {
    const matchSearch = !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !selectedCategory || p.category_name === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {view === 'detail' && (
              <button onClick={() => setView('home')} className="px-3 py-1.5 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors text-sm">
                ← {t.back}
              </button>
            )}
            <div className="cursor-pointer" onClick={() => setView('home')}>
              <h1 className="text-2xl font-bold text-blue-600">🚀 {t.title}</h1>
              <p className="text-sm text-gray-500">{t.subtitle}</p>
            </div>
          </div>
          <button
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            className="px-3 py-1.5 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors text-sm"
          >
            🌐 {lang === 'zh' ? 'EN' : '中文'}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {view === 'home' && (
          <>
            <div className="mb-8 max-w-2xl mx-auto">
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-5 py-3 border border-gray-300 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-3 text-gray-700">{t.categories}</h2>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!selectedCategory ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                >
                  🔥 {t.trending}
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat.name ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrompts.map(prompt => (
                <div
                  key={prompt.id}
                  onClick={() => viewPrompt(prompt.slug)}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 leading-tight">{prompt.title}</h3>
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full whitespace-nowrap ml-2">{prompt.category_icon} {prompt.category_name}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{prompt.description}</p>
                  <div className="flex gap-4 text-xs text-gray-400">
                    <span>👁️ {prompt.view_count}</span>
                    <span>⬇️ {prompt.download_count}</span>
                    <span>⭐ {prompt.avg_rating.toFixed(1)}</span>
                  </div>
                </div>
              ))}
              {filteredPrompts.length === 0 && (
                <div className="col-span-3 text-center py-16 text-gray-400">
                  {t.noResults}
                </div>
              )}
            </div>
          </>
        )}

        {view === 'detail' && selectedPrompt && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="mb-6">
                <div className="flex justify-between items-start mb-3">
                  <h1 className="text-3xl font-bold text-gray-900">{selectedPrompt.title}</h1>
                  <span className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full">{selectedPrompt.category_icon} {selectedPrompt.category_name}</span>
                </div>
                <p className="text-gray-600 mb-4">{selectedPrompt.description}</p>
                <div className="flex gap-4 text-sm text-gray-400">
                  <span>👁️ {selectedPrompt.view_count} {t.views}</span>
                  <span>⬇️ {selectedPrompt.download_count} {t.downloads}</span>
                  <span>⭐ {selectedPrompt.avg_rating.toFixed(1)} {t.rating}</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-semibold text-gray-800">{t.content}</h2>
                  <button
                    onClick={copyContent}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    📋 {copyText || t.copy}
                  </button>
                </div>
                <pre className="bg-gray-50 p-5 rounded-lg overflow-auto text-sm leading-relaxed border border-gray-100 whitespace-pre-wrap">
                  {selectedPrompt.content}
                </pre>
              </div>

              {selectedPrompt.examples && selectedPrompt.examples.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">{t.examples}</h2>
                  {selectedPrompt.examples.map((ex, i) => (
                    <div key={i} className="mb-4 p-5 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-sm text-gray-500 mb-2 font-medium">{t.input}:</p>
                      <p className="text-sm mb-3 text-gray-700">{ex.input}</p>
                      <p className="text-sm text-gray-500 mb-2 font-medium">{t.output}:</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{ex.output}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t mt-16 py-6 text-center text-sm text-gray-400">
        PromptHub &copy; 2026 - AI Prompt Marketplace
      </footer>
    </div>
  );
}

export default App;
