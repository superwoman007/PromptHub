const Fastify = require('fastify');
const fastify = Fastify({ logger: true });
const cors = require('@fastify/cors');
const Database = require('better-sqlite3');

fastify.register(cors, { origin: '*' });

const db = new Database('./prompthub.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS prompts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    content TEXT NOT NULL,
    examples TEXT,
    category_id INTEGER,
    creator_id INTEGER,
    is_free INTEGER DEFAULT 1,
    download_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    avg_rating REAL DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (creator_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    prompt_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, prompt_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (prompt_id) REFERENCES prompts(id)
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prompt_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prompt_id) REFERENCES prompts(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Seed categories
const seedCategories = db.prepare('INSERT OR IGNORE INTO categories (name, slug, icon, description) VALUES (?, ?, ?, ?)');
const categories = [
  ['写作', 'writing', '✍️', '文案、故事、邮件等写作提示词'],
  ['编程', 'coding', '💻', '代码生成、调试、重构提示词'],
  ['创意', 'creative', '🎨', '创意写作、头脑风暴提示词'],
  ['商业', 'business', '📊', '商业分析、营销、汇报提示词'],
  ['学习', 'learning', '📚', '学习、教学、考试提示词'],
  ['翻译', 'translation', '🌐', '多语言翻译提示词'],
  ['其他', 'other', '🗂️', '其他类型提示词']
];
categories.forEach(cat => seedCategories.run(cat[0], cat[1], cat[2], cat[3]));

// Seed sample prompts
const seedPrompts = [
  {
    title: '专业邮件助手',
    slug: 'professional-email-helper',
    description: '帮你写专业、得体的商务邮件，支持多种场景',
    content: '你是一个专业的商务邮件助手。请根据以下信息写一封专业邮件：\n\n收件人：{recipient}\n目的：{purpose}\n语气：{tone}\n\n要求：\n1. 开头简洁明了\n2. 正文逻辑清晰\n3. 结尾礼貌得体',
    examples: JSON.stringify([{ input: '给客户写一封项目进展汇报', output: '尊敬的张总：\n\n您好！感谢您一直以来对我们项目的关注与支持...' }]),
    category_id: 1
  },
  {
    title: '代码优化专家',
    slug: 'code-optimizer',
    description: '优化你的代码，提高可读性、性能和可维护性',
    content: '你是一个资深代码优化专家。请对以下代码进行优化：\n\n```\n{code}\n```\n\n优化要求：\n1. 提高代码可读性\n2. 优化性能\n3. 遵循最佳实践\n4. 添加必要的注释\n\n请给出优化后的代码和改动说明。',
    examples: JSON.stringify([{ input: '一段有嵌套循环的 Python 代码', output: '优化后使用列表推导式，性能提升 3x...' }]),
    category_id: 2
  },
  {
    title: '头脑风暴伙伴',
    slug: 'brainstorm-buddy',
    description: '帮你围绕任何主题进行头脑风暴，生成创意点子',
    content: '你是一个创意头脑风暴伙伴。请围绕以下主题生成10个创意点子：\n\n主题：{topic}\n约束条件：{constraints}\n\n要求：\n1. 点子需要新颖独特\n2. 具有可行性\n3. 每个点子附简短说明',
    examples: JSON.stringify([{ input: 'AI 创业方向', output: '1. AI 面试教练 - 模拟面试并提供实时反馈\n2. AI 菜谱生成器 - 根据冰箱食材推荐菜谱...' }]),
    category_id: 3
  },
  {
    title: 'SQL 查询生成器',
    slug: 'sql-query-generator',
    description: '用自然语言描述需求，自动生成 SQL 查询语句',
    content: '你是一个 SQL 专家。请根据以下自然语言描述生成对应的 SQL 查询：\n\n数据库表结构：\n{schema}\n\n需求描述：\n{requirement}\n\n请生成优化的 SQL 查询，并解释查询逻辑。',
    examples: JSON.stringify([{ input: '查询过去7天每日订单总额', output: 'SELECT DATE(created_at) as date, SUM(amount) as total FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) GROUP BY DATE(created_at) ORDER BY date;' }]),
    category_id: 2
  },
  {
    title: '产品需求文档模板',
    slug: 'prd-template',
    description: '帮你快速生成结构化的产品需求文档',
    content: '你是一个产品经理助手。请根据以下信息生成一份完整的 PRD 文档：\n\n产品名称：{product}\n目标用户：{users}\n核心功能：{features}\n\n要求：\n1. 包含背景、目标、功能列表、用户故事\n2. 包含非功能需求\n3. 包含里程碑和排期建议',
    examples: JSON.stringify([{ input: 'AI 聊天机器人产品', output: '## 1. 背景\n...\n## 2. 目标\n...' }]),
    category_id: 4
  },
  {
    title: '英语语法纠错老师',
    slug: 'english-grammar-checker',
    description: '纠正英语语法错误，并解释为什么',
    content: '你是一个耐心的英语老师。请检查以下英文文本的语法错误：\n\n{text}\n\n请：\n1. 标出所有语法错误\n2. 给出修正后的版本\n3. 解释每个错误的原因\n4. 给出改进建议',
    examples: JSON.stringify([{ input: 'I goed to the store yesterday and buyed some foods.', output: '修正：I went to the store yesterday and bought some food.\n\n错误说明：\n1. goed → went（go的过去式是不规则变化）\n2. buyed → bought（buy的过去式是不规则变化）\n3. foods → food（food通常不可数）' }]),
    category_id: 6
  }
];
const insertPrompt = db.prepare('INSERT OR IGNORE INTO prompts (title, slug, description, content, examples, category_id, is_free) VALUES (?, ?, ?, ?, ?, ?, 1)');
seedPrompts.forEach(p => insertPrompt.run(p.title, p.slug, p.description, p.content, p.examples, p.category_id));

// API Routes
fastify.get('/health', async () => {
  return { status: 'ok', prompts: db.prepare('SELECT COUNT(*) as count FROM prompts').get().count };
});

fastify.get('/api/categories', async () => {
  return db.prepare('SELECT * FROM categories').all();
});

fastify.get('/api/prompts', async (req) => {
  const { category, search } = req.query;
  let sql = 'SELECT p.*, c.name as category_name, c.icon as category_icon FROM prompts p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1';
  const params = [];
  if (category) {
    sql += ' AND c.slug = ?';
    params.push(category);
  }
  if (search) {
    sql += ' AND (p.title LIKE ? OR p.description LIKE ?)';
    params.push('%' + search + '%', '%' + search + '%');
  }
  sql += ' ORDER BY p.view_count DESC, p.created_at DESC';
  return db.prepare(sql).all(...params);
});

fastify.get('/api/prompts/:slug', async (req, reply) => {
  const prompt = db.prepare('SELECT p.*, c.name as category_name, c.icon as category_icon FROM prompts p LEFT JOIN categories c ON p.category_id = c.id WHERE p.slug = ?').get(req.params.slug);
  if (!prompt) return reply.code(404).send({ error: 'Not found' });
  db.prepare('UPDATE prompts SET view_count = view_count + 1 WHERE id = ?').run(prompt.id);
  return { ...prompt, examples: prompt.examples ? JSON.parse(prompt.examples) : null };
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log('PromptHub backend running on http://localhost:3001');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
