# Smooth

Spec-driven development workflow for AI coding assistants. Think before you code, implement with confidence.

```text
→ fluid not rigid
→ iterative not waterfall
→ discuss then implement
→ built for brownfield not just greenfield
```

## See it in action

```text
You: /smooth:product add-dark-mode
AI:  Let's think about what dark mode means for this project...
     [discussion happens, product.md gets written incrementally]
     [open questions listed for technical validation]

You: /smooth:technical
AI:  Let me resolve the open questions first...
     [reads code, validates feasibility, updates product.md]
     Now let's design the architecture...
     [designs solution, writes technical.md with diagrams]

You: /smooth:tasks
AI:  Let's break this into implementable chunks...
     [creates ordered task list in tasks.md]

You: /smooth:apply
AI:  Implementing task 1/5: Add theme context provider...
     ✓ Task complete
     Implementing task 2/5: Create toggle component...
     ✓ Task complete
     ...

You: /smooth:archive
AI:  Archived to smooth/changes/archive/2025-01-23-add-dark-mode/
```

## Quick Start

```bash
npx @pureforge/smooth init
```

Now use these slash commands in Claude Code:

| Command | Purpose |
|---------|---------|
| `/smooth:product` | Define product requirements (PM perspective) |
| `/smooth:technical` | Resolve open questions, then design architecture |
| `/smooth:tasks` | Break down into implementable task list |
| `/smooth:apply` | Implement code step by step from tasks.md |
| `/smooth:archive` | Archive completed changes |

## Philosophy

Each phase is a **stance with a deliverable** — you're having a conversation with your AI assistant while it simultaneously captures decisions into structured documents.

- **Product** → Define what to build, list open questions (product.md + specs/)
- **Technical** → Resolve open questions via code investigation, then design architecture (technical.md)
- **Tasks** → Break into implementable chunks (tasks.md)
- **Apply** → Implement task by task
- **Archive** → Finalize and archive

You don't have to follow the phases linearly. Jump back to product if implementation reveals new requirements. The workflow is **fluid**.

## Project Structure

After `smooth init`, your project gets:

```
your-project/
├── .claude/
│   ├── commands/smooth/     # Slash commands
│   │   ├── product.md
│   │   ├── technical.md
│   │   ├── tasks.md
│   │   ├── apply.md
│   │   └── archive.md
│   └── skills/              # Agent skills
│       ├── smooth-product/SKILL.md
│       ├── smooth-technical/SKILL.md
│       ├── smooth-tasks/SKILL.md
│       ├── smooth-apply/SKILL.md
│       └── smooth-archive/SKILL.md
└── smooth/
    └── changes/             # Change artifacts live here
        └── archive/         # Completed changes
```

## How it compares

**vs. OpenSpec** — OpenSpec requires a CLI for every operation (`openspec new change`, `openspec status --json`). Smooth is zero-runtime — the AI reads markdown directly. No CLI needed after init.

**vs. nothing** — AI coding without specs means vague prompts and unpredictable results. Smooth brings structure without ceremony.

## License

MIT
