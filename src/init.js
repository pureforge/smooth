import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, '..', 'templates');

const COMMANDS = ['product', 'technical', 'tasks', 'apply', 'verify', 'archive', 'learn'];
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
      console.log(`Detected: ${detected.map((id) => TOOLS[id].name).join(', ')}\n`);
    } else {
      const available = Object.keys(TOOLS).join(', ');
      console.error(`No AI tools detected and no --tool flag provided.\n`);
      console.error(`Available tools: ${available}`);
      console.error(`\nUsage: smooth init --tool claude,cursor,...`);
      process.exit(1);
    }
  }
  toolIds = [...new Set(toolIds.filter(Boolean))];

  const validToolIds = toolIds.filter((id) => TOOLS[id]);
  if (validToolIds.length === 0) {
    console.log('smooth init — setting up project development harness\n');
    for (const toolId of toolIds) {
      console.log(`  ✗ Unknown tool: ${toolId} (available: ${Object.keys(TOOLS).join(', ')})`);
    }
    console.error('\nNo valid AI tools were initialized.');
    process.exit(1);
  }

  console.log('smooth init — setting up project development harness\n');
  mkdirSync(join(targetPath, 'smooth'), { recursive: true });
  initMemory(targetPath);

  let initializedTools = 0;
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
    const parts = [`${COMMANDS.length} commands`];
    if (skillCount > 0) parts.push(`${skillCount} skills`);
    console.log(`  ✓ ${tool.name}: ${parts.join(' + ')}`);
    initializedTools++;
  }

  if (initializedTools === 0) {
    console.error('\nNo valid AI tools were initialized.');
    process.exit(1);
  }

  console.log(`\n  smooth/ — change artifacts and harness records\n`);
  console.log('Getting started:');
  console.log('  /smooth:product "your idea"    — define what to build');
  console.log('  /smooth:technical              — design the architecture');
  console.log('  /smooth:tasks                  — break into implementable tasks');
  console.log('  /smooth:apply                  — implement tasks');
  console.log('  /smooth:verify                 — verify and record evidence');
  console.log('  /smooth:archive                — archive completed change\n');
  console.log('  /smooth:learn                  — manual fallback for conversation memory\n');
  console.log('Conversation memory is usually agent-initiated through the smooth-learn skill.\n');
  console.log('Harness checks are run from /smooth:verify when available. Advanced: smooth check <name>\n');
}

function initMemory(targetPath) {
  const memoryDir = join(targetPath, 'smooth', 'memory');
  const domainsDir = join(memoryDir, 'domains');
  mkdirSync(domainsDir, { recursive: true });

  writeIfMissing(join(memoryDir, 'user.md'), `# User Memory

Durable preferences and collaboration patterns learned from day-to-day conversations.

## Preferences
- _Add durable preferences here._

## Response Style
- _Add response style guidance here._

## Corrections and Rebuttals
- _Record recurring user rebuttals and the assistant assumption that was wrong._

## Standing Cautions
- _Add standing cautions here._
`);

  writeIfMissing(join(memoryDir, 'pitfalls.md'), `# Conversation Pitfalls

Recurring issues from daily conversations and analysis sessions.

## Open Pitfalls
- _Add recurring conversation pitfalls here._
`);

  writeIfMissing(join(domainsDir, 'README.md'), `# Domain Playbooks

One file per recurring domain or analysis type, such as stocks, hiring, product strategy, or architecture review.
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
