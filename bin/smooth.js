#!/usr/bin/env node

import { resolve } from 'path';
import { init, getAvailableTools } from '../src/init.js';
import { status, list } from '../src/status.js';
import { validate } from '../src/validate.js';
import { check } from '../src/check.js';

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
    } else if (argv[i] === '--no-record') {
      flags.record = false;
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

  case 'check': {
    const { flags, positional } = parseArgs(args.slice(1));
    const targetPath = resolve('.');
    const ok = check(targetPath, positional[0], { record: flags.record });
    if (!ok) process.exit(1);
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
  console.log(`smooth — project development harness

Usage:
  smooth init [path] [--tool <tools>]   Initialize smooth in a project
  smooth list                           List active changes
  smooth status [name]                  Show artifact graph state
  smooth validate [name]                Check change structure

Options:
  --tool <tools>   Comma-separated: ${getAvailableTools().join(', ')}
                   Default: claude

After init, use slash commands in your AI assistant:
  /smooth:product     Discuss and write product requirements
  /smooth:technical   Discuss and create technical design
  /smooth:tasks       Discuss and break down task list
  /smooth:apply       Implement code step by step from tasks.md
  /smooth:verify      Verify implementation and record evidence
  /smooth:archive     Archive completed changes

Advanced harness runner:
  smooth check [name] [--no-record]     Run project checks and record evidence
`);
}
