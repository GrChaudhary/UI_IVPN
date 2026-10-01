# AGENTS.md — Patch 2.0 Guidelines

## Core Directives: Ponytail & Graphify Integration

For every prompt and task in **Patch 2.0**, strictly apply the following **Ponytail** (minimalist engineering) and **Graphify** (architectural traceability) rules:

---

### 🐴 1. Ponytail Principles (The Lazy Senior Developer)
Always follow the **Ponytail Decision Ladder** before writing or modifying code:

1. **YAGNI (You Ain't Gonna Need It)**:
   - Build only what is explicitly requested or strictly necessary for the current task.
   - Avoid speculative abstractions, future-proofing layers, or unused helper functions.
2. **Reuse First**:
   - Inspect the codebase first to find and reuse existing utilities, helpers, and patterns.
3. **Standard Library & Native APIs**:
   - Prefer standard library modules and runtime-native features (e.g. native fetch, Web APIs, built-in data structures) over adding third-party packages.
4. **Delete & Simplify**:
   - The cleanest code is the code you don't write. Prefer refactorings that reduce lines of code and simplify cognitive overhead.
5. **Zero-Fluff / High-Readability**:
   - Write clear, direct, self-explanatory code rather than clever or over-engineered patterns.
   - Never compromise on correctness, security, accessibility, or resilient error handling.

---

### 🕸️ 2. Graphify Architectural Guidelines
Align all codebase changes with **Graphify** structural analysis and knowledge graph clarity:

1. **Clean Entry Points & Modular Hierarchy**:
   - Preserve clear structural entry points (`index`, `main`, `app`, `server`, `router`) and explicit module exports.
   - Avoid tangled, tightly-coupled spaghetti code; enforce clean component/module boundaries.
2. **Minimize Blast Radius & Circular Dependencies**:
   - Keep dependency flow acyclic and unidirectional to minimize ripple effects and technical debt.
   - Ensure component and function relationships are clear and easily indexable by AST parsers.
3. **Architectural Traceability**:
   - When introducing or refactoring modules, ensure their roles and data flows are explicit and readily discoverable in the architectural knowledge graph.
