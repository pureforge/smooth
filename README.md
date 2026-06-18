# Smooth

A local-first project development harness for AI coding assistants. Smooth helps agents move from requirements to implementation, verify code with evidence, and turn real pitfalls into reusable lessons and future harness improvements.

```text
→ harness not just prompts
→ iterative not waterfall
→ discuss, implement, verify, learn
→ built for brownfield not just greenfield
```

## What is this

Smooth is a **project development harness**, not just a prompt pack. It defines a set of phases (product → technical → tasks → apply → verify → archive) and keeps durable artifacts for the work: requirements, design, tasks, workpad, verification evidence, pitfalls, and lessons.

Smooth also keeps lightweight conversation memory for day-to-day analysis that is not tied to a code change. A stock analysis preference, research checklist, response style correction, or recurring conversation pitfall can become durable memory and improve future answers.

After initialization, your AI assistant gets slash commands that shape how it thinks and works. Most harness behavior is embedded in the flow: the assistant updates the workpad while discussing, records verification evidence while checking, and captures pitfalls/lessons when they happen.

## What Smooth does

Smooth gives an AI-assisted project a lightweight control loop:

1. **Clarify the requirement** — turn a vague idea into objective product requirements.
2. **Keep process state** — preserve plan, acceptance criteria, validation ideas, notes, and confusions in `workpad.md`.
3. **Guide implementation** — break the work into ordered tasks and let the assistant implement task by task.
4. **Verify with evidence** — run project checks and record commands, outputs, and assertions in `verify.md`.
5. **Learn from mistakes** — capture real pitfalls and reusable lessons, then promote repeatable lessons into better generation rules, document rules, workflow guardrails, project checks, config defaults, or tool capabilities.

The goal is not to make the user run more commands. The goal is to make the assistant develop inside a harness that quietly records what matters and checks what can be checked by code.

Smooth has two modes:

- **Change mode** — for requirements, implementation, verification, and archive.
- **Conversation / analysis mode** — for durable user preferences, recurring analysis playbooks, and daily conversation pitfalls.

## See it in action

```text
You: /smooth:product add-dark-mode
AI:  Let's think about what dark mode means for this project...
     [discussion happens, product.md gets written incrementally]
     [workpad.md captures plan, acceptance criteria, validation notes]
     "This touches theme state and persistence; let's design the architecture next."

AI:  [reads code, resolves product blockers, writes technical.md]
     [creates tasks.md]
     [implements task 1/5]
     ✓ Task complete
     [implements task 2/5]
     ✓ Task complete
     ...

AI:  Running configured checks...
     [smooth check records lint/test/build evidence in verify.md]
     [pitfalls.md and lessons.md updated if real issues were found]
     [lessons point to candidate harness improvements, not only checks]

You: /smooth:archive
AI:  Archived to smooth/archive/2025-01-23-add-dark-mode/
```

## Quick Start

```bash
npx @pureforge/smooth init
```

In normal use, start with `/smooth:product` and let the assistant suggest or invoke the next phase. The phase commands are shortcuts, not a checklist the user has to memorize.

## Phase shortcuts

| Command | Purpose |
|---------|---------|
| `/smooth:product` | Define product requirements (PM perspective) |
| `/smooth:technical` | Resolve open questions, then design architecture |
| `/smooth:tasks` | Break down into implementable task list |
| `/smooth:apply` | Implement code step by step from tasks.md |
| `/smooth:verify` | Verify implementation, record evidence, and capture pitfalls/lessons |
| `/smooth:archive` | Archive completed changes |

The harness runner is available, but usually invoked by `/smooth:verify` rather than by the user:

```bash
npx @pureforge/smooth check <change-name>
```

`smooth check` reads `smooth.config.json` when present. Without config, it prefers a project-level `make verify` target; if none exists, it auto-detects package scripts named `lint`, `typecheck`, `test`, and `build`.

Conversation memory is usually agent-initiated through the `smooth-learn` skill. The user should not have to remember a command; the assistant decides when a correction, preference, analysis framework, or recurring pitfall is durable enough to record.

## Philosophy

Each phase is a **stance with durable artifacts** — you're having a conversation with your AI assistant while it simultaneously captures decisions, progress, verification evidence, and learning.

- **Product** → Define what to build, list open questions (product.md)
- **Technical** → Resolve open questions via code investigation, then design architecture (technical.md)
- **Tasks** → Break into implementable chunks (tasks.md)
- **Apply** → Implement task by task
- **Verify** → Validate against acceptance criteria and run project checks (verify.md)
- **Learn** → Capture real pitfalls and reusable lessons (pitfalls.md, lessons.md)
- **Archive** → Finalize and archive with the evidence intact

You don't have to follow the phases linearly. The AI suggests the next step based on change complexity — simple changes can skip technical design, while low-risk internal changes can use a lighter verification pass. The workflow is **fluid**, but completed work should still leave evidence.

Smooth's bias is to upgrade lessons over time:

```text
pitfall → lesson → harness improvement
```

`harness improvement` is deliberately broader than a code check. A lesson may become:

- a **generation rule** for `/smooth:apply` or `/smooth:technical`
- a **document rule** for workpad, product, task, verify, pitfall, or lesson artifacts
- a **workflow rule** that changes when the assistant should move phases or stop
- a **project check** in `smooth.config.json` or a project script
- a **config default** for future changes
- a **tool capability** added to Smooth itself
- a **README/skill guidance** update when the lesson is judgment-based

If a mistake can be caught by code, command, lint, or script, Smooth should help turn it into a check. If it is about how code or documents are generated, Smooth should help turn it into a stronger template, rule, or workflow guardrail instead of leaving it as a one-off reminder.

The same loop applies to daily conversation:

```text
conversation pitfall → user/domain lesson → response or analysis improvement
```

For example, if the user repeatedly asks for stock analysis, Smooth can keep a domain playbook that says to separate facts from inference, verify current prices/news before answering, include bear cases, and avoid unsupported buy/sell language.

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
    │   ├── workpad.md
    │   ├── technical.md
    │   ├── tasks.md
    │   ├── verify.md
    │   ├── pitfalls.md
    │   └── lessons.md
    ├── memory/
    │   ├── user.md          # Long-lived user preferences and response style
    │   ├── pitfalls.md      # Recurring conversation pitfalls
    │   └── domains/
    │       └── README.md    # Domain playbooks, e.g. stocks.md
    └── archive/             # Completed changes
```

Optional `smooth.config.json` project checks:

```json
{
  "checks": [
    { "id": "lint", "command": "npm run lint" },
    { "id": "unused", "command": "npx knip" },
    { "id": "duplicates", "command": "npx jscpd ." }
  ]
}
```

## How it compares

**vs. Kiro specs** — Kiro couples specs to its IDE. Smooth is tool-agnostic — works with any AI assistant that supports slash commands or skills.

**vs. nothing** — AI coding without workflow structure means vague prompts and unpredictable results. Smooth brings process without ceremony.

## License

MIT
