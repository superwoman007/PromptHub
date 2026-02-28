const Database = require('better-sqlite3');
const fs = require('fs');

const db = new Database('./prompthub.db');

// 读取 JSON 数据文件
const dataFile = process.argv[2] || './seed-data.json';

if (!fs.existsSync(dataFile)) {
  console.error(`❌ 数据文件不存在: ${dataFile}`);
  console.log('用法: node import-data.js <数据文件路径>');
  console.log('数据格式示例:');
  console.log(JSON.stringify({
    prompts: [
      {
        title: '提示词标题',
        description: '提示词描述',
        content: '提示词内容',
        category_slug: 'writing',
        examples: [
          { input: '示例输入', output: '示例输出' }
        ]
      }
    ]
  }, null, 2));
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));

if (!data.prompts || !Array.isArray(data.prompts)) {
  console.error('❌ 数据格式错误：需要包含 prompts 数组');
  process.exit(1);
}

console.log(`📦 准备导入 ${data.prompts.length} 条提示词...`);

const insertPrompt = db.prepare(`
  INSERT INTO prompts (title, slug, description, content, examples, category_id, is_free)
  VALUES (?, ?, ?, ?, ?, ?, 1)
`);

const getCategoryId = db.prepare('SELECT id FROM categories WHERE slug = ?');

let successCount = 0;
let skipCount = 0;
let errorCount = 0;

data.prompts.forEach((prompt, index) => {
  try {
    // 生成 slug
    const slug = prompt.title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now() + '-' + index;

    // 获取分类 ID
    let categoryId = null;
    if (prompt.category_slug) {
      const category = getCategoryId.get(prompt.category_slug);
      if (category) {
        categoryId = category.id;
      } else {
        console.warn(`⚠️  未找到分类: ${prompt.category_slug}，使用默认分类`);
      }
    }

    // 处理示例
    const examples = prompt.examples ? JSON.stringify(prompt.examples) : null;

    // 插入数据
    insertPrompt.run(
      prompt.title,
      slug,
      prompt.description,
      prompt.content,
      examples,
      categoryId
    );

    successCount++;
    if ((index + 1) % 10 === 0) {
      console.log(`✅ 已导入 ${index + 1}/${data.prompts.length} 条`);
    }
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      skipCount++;
    } else {
      errorCount++;
      console.error(`❌ 导入失败 [${index + 1}]: ${prompt.title}`, err.message);
    }
  }
});

console.log('\n📊 导入��成！');
console.log(`✅ 成功: ${successCount} 条`);
console.log(`⏭️  跳过: ${skipCount} 条（已存在）`);
console.log(`❌ 失败: ${errorCount} 条`);

db.close();
