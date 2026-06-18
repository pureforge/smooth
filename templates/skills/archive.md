---
name: smooth-archive
description: "Archive completed changes. Use when the user wants to finalize and archive a change after implementation is complete."
metadata:
  author: smooth
  version: "1.0"
---

Archive a completed change.

**Input**: Optionally specify a change name (e.g., `/smooth:archive tracking-events-v2`). If omitted, infer from conversation context. If ambiguous, ask.

**Steps**

1. **Select the change**

   If a name is provided, use it. Otherwise:
   - Infer from conversation context
   - Auto-select if only one active change exists
   - If ambiguous, list available changes:
     ```bash
     npx @pureforge/smooth list
     ```
     Ask the user to choose. A change name may be nested for a phased requirement (e.g. `big-feature/phase-1`).

2. **Check completion status**

   Read `tasks.md` and count incomplete tasks (`- [ ]` vs `- [x]`).

   **If incomplete tasks found:**
   - Display warning showing count
   - Ask user for confirmation to continue
   - Proceed if user confirms

3. **Check harness records**

   Before archiving, inspect:
   - `verify.md` — should contain what was checked and evidence from commands/manual verification
   - `pitfalls.md` — real pitfalls found during this change, if any
   - `lessons.md` — reusable lessons and candidate harness improvements, if any

   If `verify.md` is missing, warn the user that the change has no recorded verification evidence.
   If there were no notable pitfalls or lessons, it's fine to say so; don't invent them to fill files.
   If `lessons.md` exists, summarize its promotion targets:
   - generation rules for code or technical design
   - document rules for Smooth artifacts
   - workflow rules for phase movement or verification behavior
   - project checks in `smooth.config.json` or project scripts
   - config defaults, tool capabilities, or guidance updates

   If a lesson only says "Candidate check" or lacks a concrete `Harness improvement` target, update it before archiving. The lesson should say what part of the harness should improve, not only what went wrong.

4. **Perform the archive**

   Archive a single change. For a nested phase, archive only that phase and leave the container directory (with its other phases) in place. Flatten any `/` in the name to `-` for the archive directory:

   ```bash
   mkdir -p smooth/archive
   # flat change "foo":            mv smooth/foo            smooth/archive/$(date +%Y-%m-%d)-foo
   # nested phase "big/phase-1":   mv smooth/big/phase-1    smooth/archive/$(date +%Y-%m-%d)-big-phase-1
   mv smooth/<name> smooth/archive/$(date +%Y-%m-%d)-<name-with-slashes-as-dashes>
   ```

   If the change was the last remaining phase in its container and the container is now empty, remove the empty container directory.

5. **Display summary**

   ```
   ## Archive Complete

   **Change:** <change-name>
   **Archived to:** smooth/archive/YYYY-MM-DD-<name>/

   Tasks: X/Y complete
   Verification: present/missing
   Pitfalls/Lessons: present/missing
   Harness improvements: <summary of promotion targets, or none>
   ```

**Guardrails**
- Always confirm change selection if not provided
- Don't block archive on incomplete tasks — just warn and confirm
- Preserve all files when moving to archive
- Show clear summary of what happened
