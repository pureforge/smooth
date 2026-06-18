---
name: "Smooth: Verify"
description: "Verify implementation and record harness evidence"
category: Workflow
tags: [workflow, verify, testing]
---

Verify the implementation against acceptance criteria. Create a verification checklist, run what you can, record evidence, and turn real problems into pitfalls, lessons, and candidate harness improvements.

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
   - `workpad.md` — acceptance, validation notes, and confusions (if exists)

3. **Create verify.md**

   Based on acceptance criteria from product.md and technical.md, create `smooth/<name>/verify.md` with the following structure:

   ```markdown
   # Verify

   ## Code Review
   - [ ] <generated based on actual diff — scope, side effects, conventions, security, etc.>

   ## Automated Checks
   - [ ] `npx @pureforge/smooth check <name>` — records configured project checks here

   ## Evidence
   - <commands run, observations, and assertions>

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

   Run the harness checks yourself when possible:

   ```bash
   npx @pureforge/smooth check <name>
   ```

   `smooth check` reads `smooth.config.json` when present. Without config, it prefers a project-level `make verify` target; if none exists, it auto-detects package scripts (`lint`, `typecheck`, `test`, `build`). Project-specific checks can cover duplicate code, unused exports/files, dependency boundaries, dead references, and other mechanically verifiable lessons. Don't ask the user to run this unless the command needs credentials, dependencies, or environment access you don't have.

   Mark items as done or report issues found. If issues are significant, suggest going back to `/smooth:apply` to fix.

5. **Capture pitfalls and lessons**

   Verification is also where the harness learns.

   If verification found a real issue, create or update `smooth/<name>/pitfalls.md`:

   ```markdown
   # Pitfalls

   ## <short title>
   - Symptom:
   - Root cause:
   - How it was caught:
   - Fix / prevention:
   - Could this improve the harness? yes/no — <why>
   ```

   If a reusable lesson emerged, create or update `smooth/<name>/lessons.md`:

   ```markdown
   # Lessons

   ## <lesson stated as future guidance>
   - Source: pitfalls.md#<section>
   - Applies to: code-generation | doc-generation | workflow | project-check | config-default | tool-capability | guidance
   - Harness improvement:
     - Type: generation-rule | document-rule | workflow-rule | project-check | config-default | tool-capability | guidance-update
     - Target: <template/config/check/tool/doc to improve>
     - Idea: <specific change that would prevent or reduce this pitfall next time>
   - Mechanical option: <command/script/lint idea, or "none — judgment-based">
   ```

   Don't invent lessons to fill the file. No notable pitfall is a valid outcome; record that briefly if useful.

6. **Manual Verification hint**

   Based on the change scope, give the user a brief hint about what to manually check. Keep it to 1-2 sentences, e.g.:
   - "This change affects the settings page theme toggle — worth a quick manual check on the animation and persistence."
   - "This change touches the payment flow — worth a quick manual test of the checkout path."

   Don't list exhaustive test cases. Just point the user to the right area.

7. **Clean up**

   After all items pass:
   - Remove any temporary test code or scripts created during verification
   - Keep verify.md as a record of what was verified

8. **Suggest next step**

   When all items pass, suggest archiving: "All checks passed. Ready to archive with `/smooth:archive`."

---

## Guardrails

- **Don't fix bugs here** — If verification fails, suggest going back to `/smooth:apply`; don't fix inline.
- **Be specific, not vague** — "API returns 200" not "API works"; checklist items must be concretely verifiable.
- **Promote lessons into harness improvements** — If a problem can be caught by code, command, lint, or script, record a project-check idea. If it affects how code, docs, or workflow decisions are generated, record the template, rule, config, tool, or guidance that should change.
- **Clean up after yourself** — Remove temporary test files, scripts, or debug code once checks pass.
