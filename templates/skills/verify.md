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

   ## Code Review
   - [ ] <generated based on actual diff — scope, side effects, conventions, security, etc.>

   ## Manual Verification
   > This change affects xxx page/module — worth a quick manual check to confirm everything works as expected.
   ```

   Each item should be specific and verifiable — not vague ("works correctly") but concrete ("no unintended imports added to the auth module").

4. **Run Code Review**

   Review the actual code diff (use `git diff` against the base branch or recent commits). Generate checklist items based on what's actually relevant to this change. Consider:
   - Are changes scoped to what tasks.md specified? Flag any unrelated modifications.
   - Do changes follow the project's existing patterns? (naming, file structure, imports, etc.)
   - Are there unintended side effects on other modules? Check imports and references.
   - Is there code duplication that could be consolidated?
   - Are there potential security issues? (unsanitized input, hardcoded secrets, exposed endpoints)
   - Is error handling appropriate for the context?
   - Run available verification commands (tests, type checks, linting)

   Only include items that are relevant to the actual diff. Don't add generic items that don't apply.

   Mark items as done or report issues found. If issues are significant, suggest going back to `/smooth:apply` to fix.

5. **Manual Verification hint**

   Based on the change scope, give the user a brief hint about what to manually check. Keep it to 1-2 sentences, e.g.:
   - "This change affects the settings page theme toggle — worth a quick manual check on the animation and persistence."
   - "This change touches the payment flow — worth a quick manual test of the checkout path."

   Don't list exhaustive test cases. Just point the user to the right area.

6. **Clean up**

   After all items pass:
   - Remove any temporary test code or scripts created during verification
   - Keep verify.md as a record of what was verified

7. **Suggest next step**

   When all items pass, suggest archiving: "All checks passed. Ready to archive with `/smooth:archive`."

---

## Guardrails

- **Be thorough** — Code Review should cover all changed files, not just the main one
- **Be specific** — "API returns 200" not "API works"
- **Clean up after yourself** — Remove temporary test files, scripts, or debug code
- **Don't fix bugs here** — If verification fails, suggest going back to `/smooth:apply`, don't fix inline
- **Keep manual hints brief** — Point the user to the right area, don't write exhaustive test plans
