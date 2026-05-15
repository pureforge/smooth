---
name: "Smooth: Technical"
description: "Discuss and create technical design (technical.md)"
category: Workflow
tags: [workflow, technical, design]
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

1. **Resolve Discussion Points from product.md**

   Read `product.md` for the change. If `product.md` doesn't exist, suggest running `/smooth:product` first.

   Check if `product.md` has a **Discussion Points** section. If it does:
   - Read relevant code to investigate each point (feasibility, cost, existing patterns)
   - Discuss findings with the user
   - Once a point is resolved, update `product.md`: remove the point from Discussion Points and incorporate the decision into the appropriate section (Goals, Scope, etc.), including the reason why this approach was chosen
   - Repeat until all discussion points are resolved

   This step ensures the product requirements are finalized before designing the architecture. The final `product.md` should have no remaining discussion points.

   If there are no Discussion Points, skip directly to step 2.

2. **Design and write technical.md**

   Based on the finalized `product.md`, explore the technical design with the user. Continuously update `smooth/<name>/technical.md`.

   technical.md should use `# Technical Design` as the H1 title, and evolve to include:
   - **Architecture Overview** — System diagram (ASCII art)
   - **New/Modified Modules** — File plan, what goes where
   - **Interface Design** — TypeScript types, function signatures
   - **Core Logic** — Key algorithms, state management, data flow
   - **Integration Points** — Which existing files need changes
   - **Design Decisions** — What was chosen and why (Q&A format)
   - **Performance Considerations** — If relevant
   - **Relationship to Existing Code** — Reuse what, create what, don't touch what
   - **Technical Acceptance Criteria** — What to verify from a technical perspective (e.g., performance thresholds, error handling, edge cases, backward compatibility)

   Don't wait until the end to write — update after each meaningful design decision.

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
| Architecture choice | `technical.md` Architecture Overview |
| Module boundaries | `technical.md` New/Modified Modules |
| API/interface design | `technical.md` Interface Design |
| Implementation approach | `technical.md` Core Logic |
| What to reuse vs create | `technical.md` Relationship to Existing Code |
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
