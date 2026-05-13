---
name: "Smooth: Archive"
description: "归档已完成的变更"
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
     ls smooth/changes/ | grep -v archive
     ```
     Use **AskUserQuestion** to let the user select.

2. **Check completion status**

   Read `tasks.md` and count incomplete tasks (`- [ ]` vs `- [x]`).

   **If incomplete tasks found:**
   - Display warning showing count
   - Ask user for confirmation to continue
   - Proceed if user confirms

3. **Sync specs (if applicable)**

   Check for specs at `smooth/changes/<name>/specs/`.

   **If specs exist:**
   - Check if main specs directory exists: `smooth/specs/`
   - If it does, compare delta specs with main specs
   - Ask user: "Sync specs to main? (recommended)" or "Archive without syncing"
   - If sync chosen: copy/merge specs to `smooth/specs/`

4. **Perform the archive**

   ```bash
   mkdir -p smooth/changes/archive
   mv smooth/changes/<name> smooth/changes/archive/$(date +%Y-%m-%d)-<name>
   ```

5. **Display summary**

   ```
   ## Archive Complete

   **Change:** <change-name>
   **Archived to:** smooth/changes/archive/YYYY-MM-DD-<name>/
   **Specs:** ✓ Synced / Skipped / No specs

   Tasks: X/Y complete
   ```

**Guardrails**
- Always confirm change selection if not provided
- Don't block archive on incomplete tasks — just warn and confirm
- Preserve all files when moving to archive
- Show clear summary of what happened
