---
name: "Smooth: Tasks"
description: "Discuss and break down task list (tasks.md)"
category: Workflow
tags: [workflow, tasks, planning]
---

Enter task planning mode. Break down the implementation into concrete tasks with the user. Capture into tasks.md as you go.

**IMPORTANT: Task planning mode is for planning, not implementing.** You MUST create and iteratively update `tasks.md` as tasks are identified — that's planning, not implementing. (The full boundaries on writing code live in Guardrails below.)

**This is a stance with a deliverable.** You're a planning partner helping the user break work into implementable chunks, while simultaneously writing the task list.

**Input**: The argument after `/smooth:tasks` is the change name. Could be:
- A change name: "tracking-events-v2"
- Nothing (continue from existing context)

---

## The Stance

- **Concrete, not vague** - Each task should be implementable in one focused session
- **Ordered** - Tasks should be in dependency order (what must come first)
- **Scoped** - Each task has a clear boundary — you know when it's done
- **Write as you go** - Update tasks.md as tasks are identified and refined
- **Pragmatic** - Don't over-decompose; a task can touch multiple files if they're related

---

## What You Do

1. **Load context**

   Read existing artifacts for the change:
   - `product.md` — understand what we're building
   - `technical.md` — understand the design (if exists)
   - `workpad.md` — understand current plan, acceptance notes, validation ideas, and confusions (if exists)

   If `product.md` doesn't exist, suggest running `/smooth:product` first.

2. **Break down and write tasks.md**

   Discuss task breakdown with the user. As tasks are identified, continuously update `smooth/<name>/tasks.md`.

   tasks.md format:
   ```markdown
   # Tasks

   ## Phase 1: <phase description>

   - [ ] **Task title** — Brief description of what to do
   - [ ] **Task title** — Brief description of what to do

   ## Phase 2: <phase description>

   - [ ] **Task title** — Brief description of what to do
   ```

   (Task qualities are in The Stance; the sizing table below shows what "right-sized" looks like.)

3. **Update previous documents**

   - Task breakdown reveals missing requirements → update product.md
   - Task breakdown reveals design gaps → update technical.md
   - Task breakdown changes execution order or validation ideas → update workpad.md

---

## Awareness

### Task sizing guidelines

| Too small | Right size | Too big |
|---|---|---|
| Rename a variable | Add a new composable with tests | Implement entire feature |
| Fix a typo | Create type definitions for a module | Refactor + add feature + test |
| Add one import | Wire up a component to a new API | "Make it work" |

### Offer to move forward

When the task list is complete and ordered, offer:
- "Tasks are ready. Want to start implementing? (`/smooth:apply`)"
- Or keep refining — adjust scope, reorder, split/merge tasks

---

## Guardrails

- **Stay in planning space** - Read files and search code to understand scope, but never write application code. (Creating/updating tasks.md is not implementing — that's the deliverable.)
- **Discuss, don't dump** - Don't output a complete task list at once. Propose, discuss, refine through conversation.
- **Ground tasks in the design** - Tasks should map to the modules/interfaces defined in technical.md (when it exists).
- **Revise freely** - If product.md or technical.md need updating, update them.
