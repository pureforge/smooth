# Smooth

A workflow specification for AI coding assistants. Define how AI should approach development — from requirements to implementation — through structured phases and clear deliverables.

```text
→ workflow not tooling
→ iterative not waterfall
→ discuss then implement
→ built for brownfield not just greenfield
```

## What is this

Smooth is a **workflow standard**, not a framework. It defines a set of phases (product → technical → tasks → apply → archive) that guide AI assistants through structured development. Each phase has a clear stance, deliverable, and set of guardrails.

After initialization, your AI assistant gets slash commands that enforce this workflow. No runtime dependencies, no CLI needed after init — just markdown templates that shape how AI thinks and works.

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
AI:  Archived to smooth/archive/2025-01-23-add-dark-mode/
```

## Quick Start

```bash
npx @pureforge/smooth init
```

Now use these slash commands in your AI coding assistant:

| Command | Purpose |
|---------|---------|
| `/smooth:product` | Define product requirements (PM perspective) |
| `/smooth:technical` | Resolve open questions, then design architecture |
| `/smooth:tasks` | Break down into implementable task list |
| `/smooth:apply` | Implement code step by step from tasks.md |
| `/smooth:verify` | Verify implementation against acceptance criteria |
| `/smooth:archive` | Archive completed changes |

## Philosophy

Each phase is a **stance with a deliverable** — you're having a conversation with your AI assistant while it simultaneously captures decisions into structured documents.

- **Product** → Define what to build, list open questions (product.md)
- **Technical** → Resolve open questions via code investigation, then design architecture (technical.md)
- **Tasks** → Break into implementable chunks (tasks.md)
- **Apply** → Implement task by task
- **Verify** → Validate against acceptance criteria (verify.md)
- **Archive** → Finalize and archive

You don't have to follow the phases linearly. The AI suggests the next step based on change complexity — simple changes can skip technical design, internal refactors can skip verification. The workflow is **fluid**.

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
│   │   ├── verify.md
│   │   └── archive.md
│   └── skills/              # Agent skills
│       ├── smooth-product/SKILL.md
│       ├── smooth-technical/SKILL.md
│       ├── smooth-tasks/SKILL.md
│       ├── smooth-apply/SKILL.md
│       ├── smooth-verify/SKILL.md
│       └── smooth-archive/SKILL.md
└── smooth/                  # Change artifacts live here
    ├── <change-name>/
    │   ├── product.md
    │   ├── technical.md
    │   ├── tasks.md
    │   └── verify.md
    └── archive/             # Completed changes
```

## How it compares

**vs. Kiro specs** — Kiro couples specs to its IDE. Smooth is tool-agnostic — works with any AI assistant that supports slash commands or skills.

**vs. nothing** — AI coding without workflow structure means vague prompts and unpredictable results. Smooth brings process without ceremony.

## License

MIT
