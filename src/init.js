import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, '..', 'templates');

const COMMANDS = ['research', 'product', 'technical', 'tasks', 'apply', 'verify', 'archive', 'learn'];
const SKILLS = COMMANDS;

const TOOLS = {
  claude: {
    name: 'Claude Code',
    commandsDir: (root) => join(root, '.claude', 'commands', 'smooth'),
    skillsDir: (root) => join(root, '.claude', 'skills'),
    skillPath: (skillsDir, cmd) => join(skillsDir, `smooth-${cmd}`, 'SKILL.md'),
    commandFileName: (cmd) => `${cmd}.md`,
    formatCommand: (frontmatter, body) => `${frontmatter}\n${body}`,
    formatSkill: (content) => content,
  },
  cursor: {
    name: 'Cursor',
    commandsDir: (root) => join(root, '.cursor', 'commands'),
    skillsDir: (root) => join(root, '.cursor', 'rules'),
    skillPath: (skillsDir, cmd) => join(skillsDir, `smooth-${cmd}.mdc`),
    formatCommand: (frontmatter, body) => `${frontmatter}\n${body}`,
    formatSkill: (content) => wrapCursorRule(content),
  },
  windsurf: {
    name: 'Windsurf',
    commandsDir: (root) => join(root, '.windsurf', 'workflows'),
    skillsDir: (root) => join(root, '.windsurf', 'rules'),
    skillPath: (skillsDir, cmd) => join(skillsDir, `smooth-${cmd}.md`),
    formatCommand: (frontmatter, body) => `${frontmatter}\n${body}`,
    formatSkill: (content) => content,
  },
  copilot: {
    name: 'GitHub Copilot',
    commandsDir: (root) => join(root, '.github', 'prompts'),
    skillsDir: (root) => null,
    skillPath: () => null,
    formatCommand: (frontmatter, body) => `${frontmatter}\n${body}`,
    formatSkill: () => null,
    noSkills: true,
  },
  cline: {
    name: 'Cline',
    commandsDir: (root) => join(root, '.cline', 'commands'),
    skillsDir: (root) => join(root, '.cline', 'rules'),
    skillPath: (skillsDir, cmd) => join(skillsDir, `smooth-${cmd}.md`),
    formatCommand: (frontmatter, body) => `${frontmatter}\n${body}`,
    formatSkill: (content) => content,
  },
  codex: {
    name: 'Codex',
    commandsDir: (root) => join(root, '.codex', 'commands', 'smooth'),
    skillsDir: (root) => join(root, '.codex', 'skills'),
    skillPath: (skillsDir, cmd) => join(skillsDir, `smooth-${cmd}`, 'SKILL.md'),
    formatCommand: (frontmatter, body) => `${frontmatter}\n${body}`,
    formatSkill: (content) => content,
  },
};

export function getAvailableTools() {
  return Object.keys(TOOLS);
}

export function detectTools(targetPath) {
  const detected = [];
  const detectionMap = {
    claude: ['.claude'],
    cursor: ['.cursor', '.cursorrules'],
    windsurf: ['.windsurf', '.windsurfrules'],
    copilot: ['.github/copilot-instructions.md', '.github/instructions', '.github/prompts', '.github/agents'],
    cline: ['.cline', '.clinerules'],
    codex: ['.codex', 'AGENTS.md'],
  };

  for (const [toolId, paths] of Object.entries(detectionMap)) {
    const found = paths.some((p) => existsSync(join(targetPath, p)));
    if (found) detected.push(toolId);
  }
  return detected;
}

export async function init(targetPath, toolIds) {
  // Auto-detect if no tools specified
  if (!toolIds || toolIds.length === 0) {
    const detected = detectTools(targetPath);
    if (detected.length > 0) {
      toolIds = detected;
      console.log(`检测到：${detected.map((id) => TOOLS[id].name).join(', ')}\n`);
    } else {
      const available = Object.keys(TOOLS).join(', ');
      console.error(`没有检测到 AI 工具，也没有提供 --tool 参数。\n`);
      console.error(`可用工具：${available}`);
      console.error(`\n用法：smooth init --tool claude,cursor,...`);
      process.exit(1);
    }
  }
  toolIds = [...new Set(toolIds.filter(Boolean))];

  const validToolIds = toolIds.filter((id) => TOOLS[id]);
  if (validToolIds.length === 0) {
    console.log('smooth init — 正在设置项目开发 harness\n');
    for (const toolId of toolIds) {
      console.log(`  ✗ 未知工具：${toolId}（可用：${Object.keys(TOOLS).join(', ')}）`);
    }
    console.error('\n没有初始化任何有效 AI 工具。');
    process.exit(1);
  }

  console.log('smooth init — 正在设置项目开发 harness\n');
  mkdirSync(join(targetPath, 'smooth'), { recursive: true });
  initMemory(targetPath);

  let initializedTools = 0;
  for (const toolId of toolIds) {
    const tool = TOOLS[toolId];
    if (!tool) {
      console.log(`  ✗ 未知工具：${toolId}（可用：${Object.keys(TOOLS).join(', ')}）`);
      continue;
    }

    const commandsDir = tool.commandsDir(targetPath);
    mkdirSync(commandsDir, { recursive: true });

    const skillsDir = tool.skillsDir ? tool.skillsDir(targetPath) : null;
    if (skillsDir) mkdirSync(skillsDir, { recursive: true });

    for (const cmd of COMMANDS) {
      // Commands
      const cmdTemplate = readFileSync(join(TEMPLATES_DIR, 'commands', `${cmd}.md`), 'utf-8');
      const cmdFileName = tool.commandFileName ? tool.commandFileName(cmd) : `smooth-${cmd}.md`;
      const cmdDest = join(commandsDir, cmdFileName);
      writeFileSync(cmdDest, tool.formatCommand('', cmdTemplate).trimStart());
    }

    // Skills (skip if tool doesn't support them)
    if (!tool.noSkills && skillsDir) {
      for (const cmd of SKILLS) {
        const skillTemplate = readFileSync(join(TEMPLATES_DIR, 'skills', `${cmd}.md`), 'utf-8');
        const skillDest = tool.skillPath(skillsDir, cmd);
        mkdirSync(dirname(skillDest), { recursive: true });
        writeFileSync(skillDest, tool.formatSkill(skillTemplate));
      }
    }

    const skillCount = tool.noSkills ? 0 : SKILLS.length;
    const parts = [`${COMMANDS.length} 个命令`];
    if (skillCount > 0) parts.push(`${skillCount} 个技能`);
    console.log(`  ✓ ${tool.name}: ${parts.join(' + ')}`);
    initializedTools++;
  }

  if (initializedTools === 0) {
    console.error('\n没有初始化任何有效 AI 工具。');
    process.exit(1);
  }

  console.log(`\n  smooth/ — 变更产物与 harness 记录\n`);
  console.log('开始使用：');
  console.log('  /smooth:research "你的主题"    — 可选前置调研');
  console.log('  /smooth:product "你的想法"    — 定义要构建什么');
  console.log('  /smooth:technical              — 设计架构');
  console.log('  /smooth:tasks                  — 拆成可实现任务');
  console.log('  /smooth:apply                  — 实现任务');
  console.log('  /smooth:verify                 — 验证并记录证据');
  console.log('  /smooth:archive                — 归档已完成变更\n');
  console.log('  /smooth:learn                  — 对话记忆的手动兜底入口\n');
  console.log('对话记忆通常由 smooth-learn 技能主动触发。\n');
  console.log('Harness 检查通常由 /smooth:verify 调用。高级用法：smooth check <name>\n');
}

function initMemory(targetPath) {
  const memoryDir = join(targetPath, 'smooth', 'memory');
  const domainsDir = join(memoryDir, 'domains');
  mkdirSync(domainsDir, { recursive: true });

  writeIfMissing(join(memoryDir, 'user.md'), `# 用户记忆

从日常对话中沉淀的长期偏好和协作模式。

## 偏好
- _在这里添加长期偏好。_

## 回复风格
- _在这里添加回复风格指引。_

## 纠正与反驳
- _记录反复出现、值得沉淀的用户反驳，以及助手当时错误的假设。_

## 长期提醒
- _在这里添加长期需要注意的事项。_
`);

  writeIfMissing(join(memoryDir, 'pitfalls.md'), `# 对话踩坑记录

日常对话和分析中反复出现的问题。

## 待处理踩坑
- _在这里添加反复出现的对话坑。_
`);

  writeIfMissing(join(domainsDir, 'README.md'), `# 领域玩法

每个常见领域或分析类型一个文件，例如 stocks、hiring、product-strategy、architecture-review。
`);
}

function writeIfMissing(path, content) {
  if (!existsSync(path)) {
    writeFileSync(path, content);
  }
}

function wrapCursorRule(content) {
  const { description, body } = extractFrontmatter(content);
  return `---
description: ${description}
globs:
alwaysApply: false
---

${body}
`;
}

function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { description: '', body: content };

  const frontmatter = match[1];
  const body = match[2].trim();
  const descMatch = frontmatter.match(/description:\s*"?(.+?)"?\s*$/m);
  return { description: descMatch ? descMatch[1] : '', body };
}
