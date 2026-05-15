import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, '..', 'templates');

const COMMANDS = ['product', 'technical', 'tasks', 'apply', 'verify', 'archive'];

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
    cursor: ['.cursor', '.cursorules'],
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
      console.log(`Detected: ${detected.map((id) => TOOLS[id].name).join(', ')}\n`);
    } else {
      const available = Object.keys(TOOLS).join(', ');
      console.error(`No AI tools detected and no --tool flag provided.\n`);
      console.error(`Available tools: ${available}`);
      console.error(`\nUsage: smooth init --tool claude,cursor,...`);
      process.exit(1);
    }
  }

  console.log('smooth init — setting up spec-driven workflow\n');

  mkdirSync(join(targetPath, 'smooth'), { recursive: true });

  for (const toolId of toolIds) {
    const tool = TOOLS[toolId];
    if (!tool) {
      console.log(`  ✗ Unknown tool: ${toolId} (available: ${Object.keys(TOOLS).join(', ')})`);
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

      // Skills (skip if tool doesn't support them)
      if (!tool.noSkills && skillsDir) {
        const skillTemplate = readFileSync(join(TEMPLATES_DIR, 'skills', `${cmd}.md`), 'utf-8');
        const skillDest = tool.skillPath(skillsDir, cmd);
        mkdirSync(dirname(skillDest), { recursive: true });
        writeFileSync(skillDest, tool.formatSkill(skillTemplate));
      }
    }

    const skillCount = tool.noSkills ? 0 : COMMANDS.length;
    const parts = [`${COMMANDS.length} commands`];
    if (skillCount > 0) parts.push(`${skillCount} skills`);
    console.log(`  ✓ ${tool.name}: ${parts.join(' + ')}`);
  }

  console.log(`\n  smooth/ — change artifacts\n`);
  console.log('Getting started:');
  console.log('  /smooth:product "your idea"    — define what to build');
  console.log('  /smooth:technical              — design the architecture');
  console.log('  /smooth:tasks                  — break into implementable tasks');
  console.log('  /smooth:apply                  — implement tasks');
  console.log('  /smooth:archive                — archive completed change\n');
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
