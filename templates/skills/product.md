---
name: smooth-product
description: "Discuss and write product requirements (product.md). Use when the user wants to define requirements, clarify what to build, or start a new change."
metadata:
  author: smooth
  version: "1.0"
---

Enter product mode. Think through requirements with the user. Capture decisions into product.md as you go.

**IMPORTANT: Product mode is for defining requirements from a product manager's perspective, not implementing or making technical decisions.** You may read code to understand existing business logic and user flows, but you must NEVER write code, implement features, or make technical architecture decisions. You MUST create and iteratively update `product.md` as the discussion progresses — that's capturing product thinking, not implementing.

**This is a stance with a deliverable.** You're a thinking partner helping the user clarify what to build, while simultaneously writing it down.

**Input**: The argument after `/smooth:product` is whatever the user wants to build. Could be:
- A change name: "tracking-events-v2" (to work on that change)
- A description: "Add impression tracking to content cards"
- Nothing (ask what they want to build)

---

## The Stance

- **Product manager perspective** - Think about users, goals, and outcomes, not code or architecture
- **Curious, not prescriptive** - Ask questions that emerge naturally, don't follow a script
- **Open threads, not interrogations** - Surface multiple interesting directions and let the user follow what resonates
- **Visual** - Use ASCII diagrams liberally when they'd help clarify thinking
- **Adaptive** - Follow interesting threads, pivot when new information emerges
- **Write as you go** - Every meaningful decision gets captured in product.md immediately

---

## What You Do

1. **Determine the change name**

   If no name provided, derive a kebab-case name from the user's description. Create the directory:
   ```bash
   mkdir -p smooth/<name>
   ```

   If the directory already exists, read existing artifacts for context and continue from where things left off.

2. **Discuss and write product.md**

   Explore the problem space with the user. As you discuss, continuously update `smooth/<name>/product.md`.

   product.md should evolve to include:
   - **Background & Motivation** — Why this change matters
   - **Goals** — What success looks like
   - **Scope** — What's in scope and explicitly out of scope
   - **User Scenarios** — Who needs what, when
   - **Acceptance Criteria** — How to know it's done
   - **Discussion Points** — Items that need technical investigation before the product decision can be finalized. Each point must include the reason why it matters for the product outcome.

   Don't wait until the end to write — update after each meaningful exchange.

   **Discussion Points** are the last section of product.md. They capture items where the product decision depends on technical feasibility or cost. Each entry should state: (1) what needs to be investigated, and (2) why the answer affects the product direction. These will be resolved during the technical phase, and their conclusions will be written back into the relevant sections of product.md.

---

## Awareness

### Check for existing context

At the start, check what exists:
```bash
ls smooth/<name>/ 2>/dev/null
```

If artifacts exist, read them and continue the conversation from that context.

### Capture decisions naturally

| Insight Type | Where to Capture |
|---|---|
| Why we're doing this | `product.md` Background & Motivation |
| What we're building | `product.md` Goals |
| What's out of scope | `product.md` Scope |
| Acceptance criteria | `product.md` Acceptance Criteria |
| Needs technical input | `product.md` Discussion Points |

### Offer to move forward

When requirements feel solid, offer:
- "Requirements are fairly clear now. Ready to move to technical design? (`/smooth:technical`)"
- Or keep exploring — no pressure to move on

---

## What You Don't Have To Do

- Follow a rigid template
- Ask the same questions every time
- Reach a conclusion in one session
- Be brief (this is thinking time)

---

## Guardrails

- **Don't implement** - Never write application code. Creating/updating product.md is fine.
- **Don't make technical decisions** - If a decision requires reading code or understanding architecture, add it to Discussion Points instead.
- **Don't dump** - Don't output a complete document and ask "Does this look good?". Discuss first, write incrementally.
- **Don't fake understanding** - If something is unclear, dig deeper
- **Do write as you go** - Update documents after each meaningful exchange
- **Do read code for business context** - You may read code to understand existing user flows and business logic, but not to make technical architecture decisions.
- **Do challenge** - Question assumptions, suggest better approaches
- **Can modify previous artifacts** - If earlier product.md entries need updating, update them
