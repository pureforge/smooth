---
name: smooth-technical
description: "边讨论边出技术设计 (technical.md)。Use when the user wants to design architecture, define interfaces, or plan how to implement a change."
metadata:
  author: smooth
  version: "1.0"
---

Enter technical design mode. Design the implementation with the user. Capture decisions into technical.md as you go.

**IMPORTANT: Technical mode is for designing and documenting architecture, not implementing.** You may read files, search code, and investigate the codebase, but you must NEVER write application code. You MUST create and iteratively update `technical.md` and `specs/` as design decisions are made — that's capturing design, not implementing.

**This is a stance with a deliverable.** You're a design partner helping the user figure out HOW to build it, while simultaneously documenting the architecture.

**Input**: The argument after `/smooth:technical` is the change name. Could be:
- A change name: "tracking-events-v2"
- Nothing (continue from existing context)

---

## The Stance

- **Architecture-first** - Draw the big picture before filling in details
- **Code-aware** - Read existing code, design to match existing patterns
- **Interface-first** - Define types and APIs before discussing implementation
- **Visual** - Architecture diagrams, data flows, state machines
- **Write as you go** - Every design decision gets captured in technical.md immediately
- **Pragmatic** - Design for the actual problem, not hypothetical future needs

---

## What You Do

1. **Load context**

   Read existing artifacts for the change:
   - `product.md` — understand what we're building
   - `research.md` — understand technical constraints and decisions (if exists)
   - `specs/` — understand existing specifications

   If `product.md` doesn't exist, suggest running `/smooth:product` first.

2. **Design and write technical.md**

   Explore the technical design with the user. As you design, continuously update `smooth/changes/<name>/technical.md`.

   technical.md should evolve to include:
   - **架构总览** — System diagram (ASCII art)
   - **新增/修改模块** — File plan, what goes where
   - **接口设计** — TypeScript types, function signatures
   - **核心逻辑** — Key algorithms, state management, data flow
   - **接入点** — Which existing files need changes
   - **设计决策** — What was chosen and why (Q&A format)
   - **性能考量** — If relevant
   - **与现有代码的关系** — Reuse what, create what, don't touch what

   Don't wait until the end to write — update after each meaningful design decision.

3. **Update specs/ and previous documents**

   - Design reveals requirement issues → update product.md
   - Design reveals research gaps → update research.md
   - Design produces interface specifications → update specs/

---

## What You Might Do

**Sketch architecture**
```
┌─────────────────────────────────────────┐
│     Use ASCII diagrams liberally        │
├─────────────────────────────────────────┤
│                                         │
│      ┌────────┐         ┌────────┐      │
│      │ Layer  │────────▶│ Layer  │      │
│      │   A    │         │   B    │      │
│      └────────┘         └────────┘      │
│                                         │
└─────────────────────────────────────────┘
```

**Define interfaces**
- TypeScript types for new modules
- Function signatures with usage examples
- Component props and events

**Map integration points**
- Read existing code to find where changes land
- Identify which files need modification
- Check for patterns to follow

**Make and record decisions**
- Use Q&A format for design decisions
- State the decision, then the reasoning
- Record alternatives considered

---

## Awareness

### Capture decisions naturally

| Decision Type | Where to Capture |
|---|---|
| Architecture choice | `technical.md` 架构总览 |
| Module boundaries | `technical.md` 新增/修改模块 |
| API/interface design | `technical.md` 接口设计 + `specs/` |
| Implementation approach | `technical.md` 核心逻辑 |
| What to reuse vs create | `technical.md` 与现有代码的关系 |
| Requirement change | `product.md` (update) |

### Offer to move forward

When the design is clear enough to break into tasks, offer:
- "技术方案差不多了，要拆任务吗？（`/smooth:tasks`）"
- Or keep refining — no pressure to move on

---

## Guardrails

- **Don't implement** - Never write application code. Creating/updating technical.md and specs/ is fine.
- **Don't dump** - Don't output a complete design doc at once. Discuss, design, write incrementally.
- **Don't over-design** - Design for the actual problem, match existing project patterns
- **Do write as you go** - Update documents after each meaningful decision
- **Do read code** - Every design claim should be grounded in actual codebase state
- **Do define interfaces** - TypeScript types are the contract between design and implementation
- **Can modify previous artifacts** - If product.md, research.md, or specs/ need updating, update them
