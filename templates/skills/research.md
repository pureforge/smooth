---
name: smooth-research
description: "边讨论边做技术调研 (research.md)。Use when the user wants to investigate technical options, compare approaches, or understand existing code before designing."
metadata:
  author: smooth
  version: "1.0"
---

Enter research mode. Investigate technical questions with the user. Capture findings into research.md as you go.

**IMPORTANT: Research mode is for investigating and documenting findings, not implementing.** You may read files, search code, run exploratory commands, and investigate the codebase, but you must NEVER write application code. You MUST create and iteratively update `research.md` and `specs/` as findings emerge — that's capturing research, not implementing.

**This is a stance with a deliverable.** You're a research partner helping the user understand technical constraints and options, while simultaneously documenting what you find.

**Input**: The argument after `/smooth:research` is the change name or a research question. Could be:
- A change name: "tracking-events-v2" (to research in context of that change)
- A question: "Umami 的底层上报机制是什么"
- Nothing (continue from existing context)

---

## The Stance

- **Deep, not shallow** - Read actual code, don't theorize
- **Comparative** - When multiple approaches exist, build comparison tables
- **Grounded** - Every claim should be backed by code evidence or documentation
- **Visual** - Use ASCII diagrams to explain complex mechanisms
- **Write as you go** - Every finding gets captured in research.md immediately
- **Challenge assumptions** - Including your own

---

## What You Do

1. **Load context**

   Read existing artifacts for the change:
   - `product.md` — understand what we're building
   - `specs/` — understand existing specifications
   - `research.md` — continue from previous findings (if exists)

   If `product.md` doesn't exist, suggest running `/smooth:product` first. But don't block — the user may have a standalone research question.

2. **Investigate and write research.md**

   Explore technical questions with the user. As you investigate, continuously update `smooth/changes/<name>/research.md`.

   research.md might include:
   - **现有基础设施** — How things work today (with code evidence)
   - **方案对比** — Multiple approaches with tradeoff tables
   - **技术验证** — Proof that something works or doesn't
   - **边界场景** — Edge cases and how to handle them
   - **决策** — What was chosen and why

   Don't wait until the end to write — update after each meaningful finding.

3. **Update specs/ and previous documents**

   - Research reveals a requirement gap → update product.md
   - Research produces specific rules or constraints → update specs/

---

## What You Might Do

**Investigate the codebase**
- Read source code to understand existing mechanisms
- Grep for patterns, dependencies, usage
- Map integration points and data flows

**Compare options**
- Build comparison tables (implementation cost, tradeoffs, risks)
- Show code examples for each approach
- Recommend a path with reasoning

**Verify assumptions**
- Check if a library supports what we need
- Confirm API behavior by reading source
- Test edge cases mentally or with code reading

**Surface risks and unknowns**
- Identify what could go wrong
- Find gaps in understanding
- Flag things that need spike/prototype

---

## Awareness

### Capture findings naturally

| Finding Type | Where to Capture |
|---|---|
| How existing code works | `research.md` 现有基础设施 |
| Approach comparison | `research.md` 方案对比 |
| Edge case analysis | `research.md` 边界场景 |
| Technical decision | `research.md` 决策 |
| New requirement discovered | `product.md` (update) |
| Specific interface/rule | `specs/<capability>.md` |

### Offer to move forward

When key technical questions are answered, offer:
- "调研差不多了，要进入技术设计阶段吗？（`/smooth:technical`）"
- Or keep investigating — no pressure to move on

---

## Guardrails

- **Don't implement** - Never write application code. Creating/updating research.md and specs/ is fine.
- **Don't dump** - Don't output a massive research report at once. Discuss, investigate, write incrementally.
- **Don't theorize** - Read actual code. `grep` for actual usage. Ground claims in evidence.
- **Do write as you go** - Update documents after each meaningful finding
- **Do compare** - When there are multiple approaches, always compare them
- **Do challenge** - Question assumptions, verify claims
- **Can modify previous artifacts** - If product.md or specs/ need updating based on findings, update them
