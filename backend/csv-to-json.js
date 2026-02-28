const fs = require('fs');
const path = require('path');

// 读取 CSV 文件
const csvFile = process.argv[2] || '/root/.openclaw/workspace-mda/drafts/prompts-high-quality.csv';
const outputFile = process.argv[3] || './seed-data.json';

if (!fs.existsSync(csvFile)) {
  console.error(`❌ CSV 文件不存在: ${csvFile}`);
  process.exit(1);
}

console.log(`📖 读取 CSV 文件: ${csvFile}`);

const csvContent = fs.readFileSync(csvFile, 'utf-8');
const lines = csvContent.split('\n').filter(line => line.trim());

// 解析 CSV 头部
const headers = lines[0].split(',').map(h => h.trim());
console.log(`📋 CSV 列: ${headers.join(', ')}`);

// 分类映射
const categoryMap = {
  '编程开发': 'coding',
  '编程': 'coding',
  '写作': 'writing',
  '创意': 'creative',
  '商业': 'business',
  '学习': 'learning',
  '语言/翻译': 'translation',
  '翻译': 'translation',
  '其他': 'other'
};

const prompts = [];
let skipCount = 0;

// 解析每一行
for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;

  // 简单 CSV 解析（处理引号内的逗号）
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());

  if (values.length < 2) {
    skipCount++;
    continue;
  }

  const title = values[0]?.replace(/^"|"$/g, '').trim();
  const content = values[1]?.replace(/^"|"$/g, '').trim();
  const category = values[2]?.replace(/^"|"$/g, '').trim();

  if (!title || !content) {
    skipCount++;
    continue;
  }

  // 生成描述（从内容中提取前100个字符）
  let description = content.substring(0, 150);
  if (content.length > 150) {
    description += '...';
  }

  // 映射分类
  const categorySlug = categoryMap[category] || 'other';

  prompts.push({
    title,
    description,
    content,
    category_slug: categorySlug,
    examples: []
  });
}

console.log(`✅ 解析完成: ${prompts.length} 条提示词`);
console.log(`⏭️  跳过: ${skipCount} 条（数据不完整）`);

// 限制数量（可选）
const limit = parseInt(process.argv[4]) || prompts.length;
const finalPrompts = prompts.slice(0, limit);

console.log(`📦 导出: ${finalPrompts.length} 条提示词`);

// 写入 JSON 文件
const output = {
  prompts: finalPrompts
};

fs.writeFileSync(outputFile, JSON.stringify(output, null, 2), 'utf-8');
console.log(`✅ 已保存到: ${outputFile}`);

// 统计分类分布
const categoryStats = {};
finalPrompts.forEach(p => {
  categoryStats[p.category_slug] = (categoryStats[p.category_slug] || 0) + 1;
});

console.log('\n📊 分类分布:');
Object.entries(categoryStats).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
  console.log(`  ${cat}: ${count} 条`);
});
