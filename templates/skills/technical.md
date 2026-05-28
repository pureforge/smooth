---
name: smooth-technical
description: "Discuss and create technical design (technical.md). Use when the user wants to design architecture, define interfaces, or plan how to implement a change."
metadata:
  author: smooth
  version: "1.0"
---

Enter technical design mode. Design the implementation with the user. Capture decisions into technical.md as you go.

**IMPORTANT: Technical mode is for designing and documenting architecture, not implementing.** You may read files, search code, and investigate the codebase, but you must NEVER write application code. You MUST create and iteratively update `technical.md` as design decisions are made — that's capturing design, not implementing.

**This is a stance with a deliverable.** You're a design partner helping the user figure out HOW to build it, while simultaneously documenting the architecture.

**Input**: The argument after `/smooth:technical` is the change name. Could be:
- A change name: "tracking-events-v2"
- Nothing (continue from existing context)

---

## The Stance

- **Architecture-first** - Draw the big picture before filling in details
- **Code-aware** - Read existing code, design to match existing patterns
- **Interface-first** - Define types and APIs before discussing implementation
- **Visual** - Architecture diagrams, data flows, state machines
- **Write as you go** - Every design decision gets captured in technical.md immediately
- **Pragmatic** - Design for the actual problem, not hypothetical future needs

---

## What You Do

1. **Resolve Blockers from product.md**

   Read `product.md` for the change. If `product.md` doesn't exist, suggest running `/smooth:product` first.

   Check if `product.md` has a **Blockers** section. If it does:
   - Read relevant code to investigate each blocker (feasibility, cost, existing patterns)
   - Discuss findings with the user
   - Once a blocker is resolved, update `product.md`: remove it from Blockers and fold the resolution into the relevant section (Solution, Expected Benefit, Scope, etc.), including the reason why this approach was chosen
   - Repeat until all blockers are resolved or accepted as known risks

   This step ensures the product requirements are finalized before designing the architecture. The final `product.md` should have no unresolved blockers.

   If there are no Blockers, skip directly to step 2.

2. **Design and write technical.md**

   Based on the finalized `product.md`, explore the technical design with the user. Continuously update `smooth/<name>/technical.md`.

   **Organize by feature, not by artifact type.** Don't list "all files affected" then "all types" then "all functions" globally — that's horizontal slicing. Group everything for one feature together (its files, types, functions, decisions), so each feature block is self-contained and can be reviewed, discussed, or pulled into tasks.md as a unit.

   technical.md should evolve to include:

   - **Architecture Overview** — System diagram (ASCII art). Show the big picture and how features relate to each other.
   - **Features** — Short list of the features this change contains. Acts as a table of contents for the per-feature sections below.
   - **Cross-cutting Foundation** — Shared groundwork that multiple features depend on: shared types, utilities, infrastructure changes, cross-feature performance considerations. **Build this first** — features below stand on top of it. *Strict rule: only put things here that are genuinely shared by 2+ features. Anything serving a single feature belongs in that feature's section.*
   - **Feature: `<name>`** — One section per feature, ordered by dependency (foundation-dependent ones later). Each feature section contains:
     - *Files affected* — which files are new/modified/touched for this feature
     - *Types / Interfaces* — TypeScript types and contracts this feature introduces
     - *Functions / Methods* — new or modified functions and their signatures
     - *Relationship to Existing Code* — what this feature reuses, replaces, or leaves alone
     - *Design Decisions* — Q&A format: what was chosen and why, alternatives considered
   - **Technical Acceptance Criteria** — What to verify from a technical perspective (performance thresholds, error handling, edge cases, backward compatibility). Can be grouped per-feature or kept cross-cutting, whichever is clearer.

   Don't wait until the end to write — update after each meaningful design decision.

   **Why this order matters:** Architecture → Features list → Foundation → per-Feature sections roughly mirrors implementation order. Foundation gets built first; features build on it. When tasks.md reads this top-to-bottom, the task order falls out naturally.

3. **Update previous documents**

   - Design reveals requirement issues → update product.md

---

## What You Might Do

**Sketch architecture**
```
┌─────────────────────────────────────────┐
│     Use ASCII diagrams liberally        │
├─────────────────────────────────────────┤
│                                         │
│      ┌────────┐         ┌────────┐      │
│      │ Layer  │────────▶│ Layer  │      │
│      │   A    │         │   B    │      │
│      └────────┘         └────────┘      │
│                                         │
└─────────────────────────────────────────┘
```

**Define interfaces**
- TypeScript types for new modules
- Function signatures with usage examples
- Component props and events

**Map integration points**
- Read existing code to find where changes land
- Identify which files need modification
- Check for patterns to follow

**Make and record decisions**
- Use Q&A format for design decisions
- State the decision, then the reasoning
- Record alternatives considered

---

## Awareness

### Capture decisions naturally

| Decision Type | Where to Capture |
|---|---|
| Big-picture architecture, feature relationships | `technical.md` Architecture Overview |
| Shared types/utilities/infra used by 2+ features | `technical.md` Cross-cutting Foundation |
| Files, types, functions, decisions for a single feature | `technical.md` Feature: `<name>` (the relevant one) |
| What this feature reuses vs creates | Inside that feature's *Relationship to Existing Code* |
| Why a particular technical choice was made | Inside that feature's *Design Decisions* (or Foundation's, if cross-cutting) |
| Verification thresholds, edge cases | `technical.md` Technical Acceptance Criteria |
| Requirement change | `product.md` (update) |

### Offer to move forward

When the design is clear enough to break into tasks, offer:
- "Technical design looks solid. Ready to break it into tasks? (`/smooth:tasks`)"
- Or keep refining — no pressure to move on

---

## Guardrails

- **Don't implement** - Never write application code. Creating/updating technical.md is fine.
- **Don't dump** - Don't output a complete design doc at once. Discuss, design, write incrementally.
- **Don't over-design** - Design for the actual problem, match existing project patterns
- **Do write as you go** - Update documents after each meaningful decision
- **Do read code** - Every design claim should be grounded in actual codebase state
- **Do define interfaces** - TypeScript types are the contract between design and implementation
- **Can modify previous artifacts** - If product.md needs updating, update it
