---
name: "Smooth: Technical"
description: "Discuss and create technical design (technical.md)"
category: Workflow
tags: [workflow, technical, design]
---

Enter technical design mode. Design the implementation with the user. Capture decisions into technical.md as you go.

**IMPORTANT: Technical mode is for designing and documenting architecture, not implementing.** You MUST create and iteratively update `technical.md` as design decisions are made — that's capturing design, not implementing. (The full boundaries on writing code live in Guardrails below.)

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
- **Write as you go** - Capture every design decision in technical.md immediately; don't wait for the end
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

   Based on the finalized `product.md`, explore the technical design with the user. Continuously update `smooth/<name>/technical.md`. Use `# Technical Design` as the H1 title.

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

   **Why this order matters:** Architecture → Features list → Foundation → per-Feature sections roughly mirrors implementation order. Foundation gets built first; features build on it. When tasks.md reads this top-to-bottom, the task order falls out naturally.

   ---

   **When Design Decisions involves comparing multiple options**

   Give the user a comparison, not just a conclusion. Don't pick silently.

   *Reference dimensions* (a thinking checklist, not a required schema — use them to avoid blind spots):

   - *Implementation cost* — effort, complexity, new concepts introduced
   - *End result* — how well it solves the problem, output quality
   - *Maintenance cost* — ongoing burden, debt, test complexity
   - *Risk & reversibility* — what could go wrong, how hard to roll back

   When you actually write the comparison, only list points that *matter for this decision*. If a dimension is the same across all candidates, drop it. If a candidate has a single decisive trait, one line is enough — don't pad to fill the table.

   After the comparison, state: **the recommendation**, **which consideration weighed most this time** (not all dimensions are equally important per decision), and **what choosing this means giving up** (the accepted trade-off).

3. **Update previous documents**

   - Design reveals requirement issues → update product.md

---

## Awareness

### Offer to move forward

When the design is clear enough to break into tasks, offer:
- "Technical design looks solid. Ready to break it into tasks? (`/smooth:tasks`)"
- Or keep refining — no pressure to move on

---

## Guardrails

- **Stay in design space** - Read files and search code freely, but never write application code; every design claim should be grounded in actual codebase state. (Creating/updating technical.md is not implementing — that's the deliverable.)
- **Discuss, don't dump** - Don't output a complete design doc at once. Design and write incrementally through conversation.
- **Don't over-design** - Design for the actual problem; match existing project patterns rather than inventing new ones.
- **Define interfaces** - TypeScript types are the contract between design and implementation.
- **Revise freely** - If product.md needs updating as design reveals issues, update it.
