---
name: "Smooth: Archive"
description: "Archive completed changes"
category: Workflow
tags: [workflow, archive]
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
     npx smooth list
     ```
     Use **AskUserQuestion** to let the user select. A change name may be nested for a phased requirement (e.g. `big-feature/phase-1`).

2. **Check completion status**

   Read `tasks.md` and count incomplete tasks (`- [ ]` vs `- [x]`).

   **If incomplete tasks found:**
   - Display warning showing count
   - Ask user for confirmation to continue
   - Proceed if user confirms

3. **Perform the archive**

   Archive a single change. For a nested phase, archive only that phase and leave the container directory (with its other phases) in place. Flatten any `/` in the name to `-` for the archive directory:

   ```bash
   mkdir -p smooth/archive
   # flat change "foo":            mv smooth/foo            smooth/archive/$(date +%Y-%m-%d)-foo
   # nested phase "big/phase-1":   mv smooth/big/phase-1    smooth/archive/$(date +%Y-%m-%d)-big-phase-1
   mv smooth/<name> smooth/archive/$(date +%Y-%m-%d)-<name-with-slashes-as-dashes>
   ```

   If the change was the last remaining phase in its container and the container is now empty, remove the empty container directory.

4. **Display summary**

   ```
   ## Archive Complete

   **Change:** <change-name>
   **Archived to:** smooth/archive/YYYY-MM-DD-<name>/

   Tasks: X/Y complete
   ```

**Guardrails**
- Always confirm change selection if not provided
- Don't block archive on incomplete tasks — just warn and confirm
- Preserve all files when moving to archive
- Show clear summary of what happened
