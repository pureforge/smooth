---
name: smooth-learn
description: "Capture durable user preferences, domain playbooks, and conversation pitfalls from daily collaboration. Use when the conversation reveals reusable memory outside a specific code change."
metadata:
  author: smooth
  version: "1.0"
---

Update Smooth memory from the current conversation. This is usually agent-initiated: decide whether the conversation contains durable learning instead of waiting for the user to run a command.

Use this when the conversation reveals durable collaboration knowledge, even if there is no code change or product requirement. Examples:
- The user corrects how analysis should be structured
- The user states a reusable preference
- A recurring pitfall appears in daily conversation
- A domain playbook should be refined, such as stocks, hiring, product strategy, or architecture review

Do not record everything. Only capture information likely to improve future work.

**Input**: Optionally use a memory topic if the user explicitly names one (e.g., `stocks`, `response-style`). Otherwise infer the topic from the conversation.

---

## What You Do

1. **Classify the memory**

   Decide which memory target should be updated:
   - `smooth/memory/user.md` — durable user preferences, response style, standing cautions
   - `smooth/memory/domains/<topic>.md` — recurring domain or analysis playbook
   - `smooth/memory/pitfalls.md` — recurring conversation pitfalls and how to prevent them

   If the memory is sensitive, personal, or ambiguous, ask before writing it down.

2. **Read existing memory first**

   Read the target file if it exists. Also read `smooth/memory/user.md` when updating a domain playbook, because user-level preferences override domain defaults.

3. **Write only durable learning**

   Record facts as concise, reusable guidance. Separate:
   - **Preference** — how the user wants future collaboration to behave
   - **Playbook** — a reusable analysis structure or domain checklist
   - **Pitfall** — a mistake pattern that should be avoided
   - **Harness improvement** — a candidate rule, template change, source policy, or tool capability

   Prefer this structure for domain files:

   ```markdown
   # <Domain> Playbook

   ## User Preferences
   - <durable preference for this domain>

   ## Required Analysis Shape
   - <sections or sequence the user expects>

   ## Source Policy
   - <when to browse, cite, verify freshness, or distinguish fact/inference/opinion>

   ## Pitfalls
   - <recurring mistake and prevention>

   ## Harness Improvements
   - Type: response-style | analysis-framework | source-policy | workflow-rule | tool-capability | guidance-update
   - Target: <memory/template/check/tool/doc to improve>
   - Idea: <specific improvement>
   ```

4. **Preserve signal**

   Keep memory short. Merge with existing entries instead of appending duplicates. Remove stale wording only when the conversation clearly supersedes it.

5. **Report what changed**

   Summarize:
   - Memory file updated
   - New or changed preferences/playbook rules
   - Any candidate harness improvements

---

## Guardrails

- **Do not overfit** — one casual wording preference is not a durable rule unless the user corrects or emphasizes it.
- **Do not store secrets** — never record credentials, private identifiers, or sensitive personal data.
- **Separate facts from preferences** — especially in research, finance, legal, medical, or other high-stakes analysis.
- **Fresh data still needs verification** — memory can shape analysis, but it cannot replace current sources when facts may have changed.
