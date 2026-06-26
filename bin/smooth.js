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
    const toolIds = flags.tool ? flags.tool.split(',').map((t) => t.trim()).filter(Boolean) : null;
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
    console.error(`smooth: 未知命令 "${command}"\n`);
    printHelp();
    process.exit(1);
  }
}

function printHelp() {
  console.log(`smooth — 项目开发 harness

用法：
  smooth init [path] [--tool <tools>]   初始化项目中的 smooth
  smooth list                           列出活跃变更
  smooth status [name]                  查看产物图状态
  smooth validate [name]                检查变更结构
  smooth check [name] [--no-record]     运行项目检查并记录证据

选项：
  --tool <tools>   逗号分隔：${getAvailableTools().join(', ')}
                   默认：自动检测；未检测到时需要显式指定

初始化后，可在 AI 助手里使用这些斜杠命令：
  /smooth:research    可选前置调研
  /smooth:product     讨论并写产品需求
  /smooth:technical   讨论并写技术设计
  /smooth:tasks       讨论并拆任务
  /smooth:apply       按 tasks.md 逐步实现
  /smooth:verify      验证实现并记录证据
  /smooth:archive     归档已完成变更
  /smooth:learn       对话记忆的手动兜底入口

对话记忆：
  smooth-learn 技能     在支持时由助手主动更新记忆

Harness 检查：
  smooth check 会读取 smooth.config.json；没有配置时会自动检测 make verify 或 package scripts。
`);
}
