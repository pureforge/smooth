#!/usr/bin/env node

import { resolve } from 'path';
import { init, getAvailableTools } from '../src/init.js';
import { status, list } from '../src/status.js';
import { validate } from '../src/validate.js';

const args = process.argv.slice(2);
const command = args[0];

function parseArgs(argv) {
  const flags = {};
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--tool' && i + 1 < argv.length) {
      flags.tool = argv[++i];
    } else if (argv[i] === '--force' || argv[i] === '-f') {
      flags.force = true;
    } else if (!argv[i].startsWith('-')) {
      positional.push(argv[i]);
    }
  }
  return { flags, positional };
}

switch (command) {
  case 'init': {
    const { flags, positional } = parseArgs(args.slice(1));
    const targetPath = resolve(positional[0] || '.');
    const toolIds = flags.tool ? flags.tool.split(',').map((t) => t.trim()) : null;
    await init(targetPath, toolIds);
    break;
  }

  case 'status': {
    const targetPath = resolve('.');
    status(targetPath, args[1]);
    break;
  }

  case 'list':
  case 'ls': {
    const targetPath = resolve('.');
    list(targetPath);
    break;
  }

  case 'validate': {
    const targetPath = resolve('.');
    validate(targetPath, args[1]);
    break;
  }

  case 'help':
  case '--help':
  case '-h':
  case undefined: {
    printHelp();
    break;
  }

  default: {
    console.error(`smooth: unknown command "${command}"\n`);
    printHelp();
    process.exit(1);
  }
}

function printHelp() {
  console.log(`smooth — spec-driven development workflow

Usage:
  smooth init [path] [--tool <tools>]   Initialize smooth in a project
  smooth list                           List active changes
  smooth status [name]                  Show artifact graph state
  smooth validate [name]                Check change structure

Options:
  --tool <tools>   Comma-separated: ${getAvailableTools().join(', ')}
                   Default: claude

After init, use slash commands in your AI assistant:
  /smooth:product     边讨论边写需求文档
  /smooth:research    边讨论边做技术调研
  /smooth:technical   边讨论边出技术设计
  /smooth:tasks       边讨论边拆任务清单
  /smooth:apply       按 tasks.md 逐步实施代码
  /smooth:archive     归档已完成的变更
`);
}
