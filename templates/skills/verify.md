---
name: smooth-verify
description: "Verify implementation against acceptance criteria. Use after /smooth:apply to validate the change meets requirements."
metadata:
  author: smooth
  version: "1.0"
---

Verify the implementation against acceptance criteria. Create a verification checklist, run what you can, and guide the user through manual checks.

**Input**: Optionally specify a change name (e.g., `/smooth:verify tracking-events-v2`). If omitted, infer from conversation context. If ambiguous, ask.

---

## What You Do

1. **Select the change**

   If a name is provided, use it. Otherwise:
   - Infer from conversation context if the user mentioned a change
   - Auto-select if only one active change exists
   - If ambiguous, list available changes and ask

   Always announce: "Using change: <name>"

2. **Read all context**

   Read every artifact in the change directory:
   - `product.md` — acceptance criteria and requirements
   - `technical.md` — technical acceptance criteria (if exists)
   - `tasks.md` — what was implemented

3. **Create verify.md**

   Based on acceptance criteria from product.md and technical.md, create `smooth/<name>/verify.md` with the following structure:

   ```markdown
   # Verify

   ## AI Verification
   - [ ] <item AI can verify by running commands or reading code>
   - [ ] <item AI can verify by running commands or reading code>

   ## Manual Verification
   - [ ] <item that requires human testing> — <how to test>
   - [ ] <item that requires human testing> — <how to test>
   ```

   Each item should be specific and verifiable — not vague ("works correctly") but concrete ("dark mode toggle persists after page refresh").

4. **Run AI Verification**

   For each item in AI Verification:
   - Run the relevant commands (tests, type checks, linting, curl, etc.)
   - Read code to confirm implementation matches requirements
   - Mark items as done: `- [ ]` → `- [x]`
   - If an item fails, report what went wrong and ask for guidance

5. **Guide Manual Verification**

   Present the Manual Verification items to the user:
   - Explain what to test and how
   - Wait for user feedback on each item
   - Mark items as the user confirms: `- [ ]` → `- [x]`
   - If an item fails, suggest going back to fix it with `/smooth:apply`

6. **Clean up**

   After all items pass:
   - Remove any temporary test code or scripts created during verification
   - Keep verify.md as a record of what was verified

7. **Suggest next step**

   When all items pass, suggest archiving: "All checks passed. Ready to archive with `/smooth:archive`."

---

## Guardrails

- **Don't skip items** — Every acceptance criterion should map to at least one verification item
- **Be specific** — "API returns 200" not "API works"
- **Clean up after yourself** — Remove temporary test files, scripts, or debug code
- **Don't fix bugs here** — If verification fails, suggest going back to `/smooth:apply`, don't fix inline
- **Manual items need instructions** — Tell the user exactly what to do and what to look for
