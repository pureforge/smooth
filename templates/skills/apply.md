---
name: smooth-apply
description: "Implement code step by step from tasks.md. Use when the user wants to start implementing, continue implementation, or work through tasks."
metadata:
  author: smooth
  version: "1.0"
---

Implement tasks from a change.

**Input**: Optionally specify a change name (e.g., `/smooth:apply tracking-events-v2`). If omitted, infer from conversation context. If ambiguous, ask.

**Steps**

1. **Select the change**

   If a name is provided, use it. Otherwise:
   - Infer from conversation context if the user mentioned a change
   - Auto-select if only one active change exists
   - If ambiguous, list available changes and ask

   Always announce: "Using change: <name>"

2. **Read all context**

   Read every artifact in the change directory:
   - `product.md` — what we're building
   - `technical.md` — how to build it (if exists)
   - `tasks.md` — what to implement

   **IMPORTANT**: Read ALL available artifacts before starting. The design decisions are your implementation guide.

3. **Show current progress**

   Display:
   - Progress: "N/M tasks complete"
   - Remaining tasks overview
   - Which task is next

4. **Implement tasks (loop until done or blocked)**

   For each pending task:
   - Show which task is being worked on
   - Make the code changes required
   - Keep changes minimal and focused on the task
   - Mark task complete in tasks.md: `- [ ]` → `- [x]`
   - Continue to next task

   **Pause if:**
   - Task is unclear → ask for clarification
   - Implementation reveals a design issue → suggest updating artifacts
   - Error or blocker encountered → report and wait for guidance
   - User interrupts

5. **On completion or pause, show status**

   Display:
   - Tasks completed this session
   - Overall progress: "N/M tasks complete"
   - If all done: assess whether verification is needed and suggest next step:
     - **Needs verification** (UI changes, user-facing behavior, multi-module integration, complex logic) → "Implementation complete. This change has user-facing behavior worth verifying. (`/smooth:verify`)"
     - **Can skip verification** (pure refactor, internal logic with good test coverage, config changes) → "Implementation complete. This is a clean internal change. Ready to archive? (`/smooth:archive`)"
   - If paused: explain why and wait for guidance

**Output During Implementation**

```
## Implementing: <change-name>

Working on task 3/7: <task description>
[...implementation happening...]
✓ Task complete

Working on task 4/7: <task description>
[...implementation happening...]
✓ Task complete
```

**Output On Completion**

```
## Implementation Complete

**Change:** <change-name>
**Progress:** 7/7 tasks complete ✓

All tasks complete! You can archive this change with `/smooth:archive`.
```

**Output On Pause**

```
## Implementation Paused

**Change:** <change-name>
**Progress:** 4/7 tasks complete

### Issue Encountered
<description of the issue>

What would you like to do?
```

**Guardrails**
- Read ALL context files before starting, and follow the project's existing patterns (read CLAUDE.md)
- Keep code changes minimal and scoped to the current task; mark its checkbox `- [x]` immediately on completion
- Don't guess — pause and ask on ambiguity, errors, blockers, or when implementation reveals a design issue (then suggest artifact updates)
