# Architecture Decision Records

> Version: 0.1.0 Draft
>
> Status: Living architecture log
>
> Source documents: `docs/ARCHITECTURE.md` and `docs/ROADMAP.md`

This file records important architectural decisions for the Form Builder
ecosystem. Decisions are listed chronologically by decision number. Dates should
be filled in when decisions are formally accepted by the project.

ADR status values:

- Proposed
- Accepted
- Superseded
- Rejected

---

## ADR-0001: Build A Headless Schema-Driven Form Engine

Date: TBD

Status: Accepted

### Context

The project goal is to support simple forms, enterprise forms, surveys, CRM
forms, HR forms, medical forms, government forms, dynamic server-driven forms,
multi-step workflows, and future drag-and-drop builders.

These use cases require a shared runtime model that is independent from any
specific UI library.

### Decision

The project will be built as a headless, schema-driven form engine.

All forms must ultimately resolve to a common `FormSchema`, regardless of
whether the source is JSON, JSX, imported data, a database, an API, or a visual
builder.

### Consequences

- The core engine owns state, validation, events, plugins, submission, and
  schema parsing.
- Developers own visual rendering and design system choices.
- Schema normalization becomes a required boundary before rendering.
- Every public authoring API must map cleanly into the same schema model.

---

## ADR-0002: Keep The Core Package Framework-Independent

Date: TBD

Status: Accepted

### Context

The project must support React first, but the long-term roadmap includes React
Native, Vue, Angular, Svelte, Flutter, and other renderers.

If form logic is coupled to React, other renderers would need to reimplement
core behavior or depend on React unnecessarily.

### Decision

`@your-org/form-core` must not import React.

Core responsibilities are limited to schema parsing, state, validation,
registry, events, plugins, layout models, errors, and lifecycle management.

React-specific behavior belongs in `@your-org/form-react`.

### Consequences

- Core APIs must be plain TypeScript.
- React hooks, context, providers, and components live outside the core package.
- Renderer packages can share the same engine.
- Cross-framework support remains possible without rewriting business logic.

---

## ADR-0003: Use A Monorepo With Clear Package Boundaries

Date: TBD

Status: Accepted

### Context

The ecosystem includes core logic, React bindings, default UI components,
themes, a future builder, examples, documentation, and playground apps.

These packages need independent responsibilities while sharing tooling,
versions, and internal contracts.

### Decision

Use a monorepo structure:

```text
apps/
    docs/
    playground/

packages/
    core/
    react/
    ui/
    themes/
    builder/

examples/
    nextjs/
    vite/
    react/
    shadcn/
    mui/
```

Recommended tooling:

- Turborepo.
- Yarn Workspaces.
- tsup.
- Vitest.
- ESLint.
- Prettier.
- Changesets.

### Consequences

- Package responsibilities can evolve independently.
- Shared tooling keeps package behavior consistent.
- Internal packages can be developed together before public release.
- Boundaries must be enforced so UI and React code do not leak into core.

---

## ADR-0004: Support Schema API, JSX API, And Builder API

Date: TBD

Status: Accepted

### Context

Developers need multiple authoring styles:

- Direct schema usage for server-driven and dynamic forms.
- JSX usage for React developers who prefer component composition.
- Builder-generated schema for future visual editing.

### Decision

The project will support three public authoring APIs:

```tsx
<Form schema={schema} />
```

```tsx
<Form>
  <TextField name="name" label="Name" />
</Form>
```

```tsx
<Form schema={builderOutput} />
```

Internally, all three APIs must produce the same `FormSchema`.

### Consequences

- JSX field components are authoring helpers, not separate runtime primitives.
- The builder does not need its own runtime renderer.
- Tests must verify equivalent behavior between schema-authored and JSX-authored
  forms.
- Documentation must explain the schema as the canonical format.

---

## ADR-0005: Require A Field Registry

Date: TBD

Status: Accepted

### Context

The system must support built-in fields, custom fields, package-provided fields,
and future builder field palettes.

Hardcoding every field type into the renderer would make extension difficult.

### Decision

Every field type must resolve through a field registry.

The core registry stores field definitions. React field components are resolved
by the React renderer through overrides, themes, default UI, or renderer
registrations.

### Consequences

- Developers can register custom field types.
- The builder can inspect registered field definitions.
- Field behavior can be extended without modifying the core renderer.
- Missing field types can be reported as schema or rendering errors.

---

## ADR-0006: Use Adapter-Based Validation

Date: TBD

Status: Accepted

### Context

Developers may already use Zod, Yup, Valibot, custom validators, or backend
schema validators.

The architecture explicitly avoids forcing one validation library.

### Decision

Validation will be adapter-based.

The core engine defines a common `ValidationAdapter` interface and consumes
validation results through normalized `FormErrors`.

### Consequences

- The engine can support multiple validation libraries.
- Validation libraries remain optional.
- Built-in validation rules can exist without becoming the only supported path.
- Adapter behavior must be tested through a common contract suite.

---

## ADR-0007: Use Plugins For Extensible Behavior

Date: TBD

Status: Accepted

### Context

Planned features include autosave, analytics, drafts, undo/redo, history,
keyboard shortcuts, AI assistance, and custom business behavior.

Adding these directly to the engine would make the core larger and harder to
maintain.

### Decision

Major optional behaviors should be implemented as plugins when practical.

Plugins receive a `PluginContext` and communicate through the event system.
Plugins must not mutate UI directly.

### Consequences

- Core remains smaller and predictable.
- Optional behavior can be installed per form.
- Plugin cleanup is required for subscriptions and external resources.
- Plugin errors need a dedicated error category.

---

## ADR-0008: Route Cross-Cutting Communication Through Events

Date: TBD

Status: Accepted

### Context

Plugins, host applications, and internal managers need a common way to observe
form lifecycle transitions and user interactions.

Direct coupling between managers and plugins would make extension brittle.

### Decision

The engine will expose a typed event system.

Required events include:

- `init`
- `load`
- `mount`
- `fieldRegister`
- `focus`
- `blur`
- `change`
- `validate`
- `stepChange`
- `submit`
- `success`
- `error`
- `destroy`

### Consequences

- Plugins can subscribe to lifecycle and interaction events.
- Host applications can observe behavior without replacing internals.
- Event payloads become part of the public contract.
- Event ordering must be deterministic and documented.

---

## ADR-0009: Keep UI Fully Replaceable

Date: TBD

Status: Accepted

### Context

The project must work with shadcn/ui, MUI, Ant Design, Chakra UI, Bootstrap,
Tailwind, custom design systems, and no specific design system at all.

### Decision

Every visual element must be replaceable through:

- Component overrides.
- Slot overrides.
- Themes.
- Render props where appropriate.
- CSS variables or class names where appropriate.

Official themes define appearance only and must not contain business logic.

### Consequences

- The renderer needs a deterministic component resolution order.
- Default UI components must be optional.
- Themes cannot alter state, validation, or submission behavior.
- Documentation must show how to replace fields, wrappers, labels, errors, and
  layout slots.

---

## ADR-0010: Treat Performance As A First-Class Architecture Requirement

Date: TBD

Status: Accepted

### Context

The target includes enterprise forms and forms with 1000+ fields.

Naive context updates or whole-form re-renders would not scale.

### Decision

The architecture must support:

- Field-level subscriptions.
- Context splitting.
- Memoization.
- Lazy rendering.
- Virtualization.
- Dynamic imports.
- State isolation.
- Minimal re-renders.

### Consequences

- State updates must be scoped as narrowly as practical.
- React hooks must avoid forcing global form re-renders.
- Large arrays and inactive steps should be eligible for virtualization or lazy
  rendering.
- Performance tests should be added before claiming enterprise-scale support.

---

## ADR-0011: Treat Accessibility As A Requirement

Date: TBD

Status: Accepted

### Context

The official UI package is expected to support production applications,
including enterprise, medical, government, and other accessibility-sensitive
contexts.

### Decision

Accessibility is mandatory for official UI components and renderer behavior.

Official components must support ARIA, keyboard navigation, focus management,
screen readers, high contrast, reduced motion, labels, descriptions, and error
relationships.

### Consequences

- Accessibility must be part of component acceptance criteria.
- Error messages and labels require stable IDs and relationships.
- Keyboard behavior must be tested.
- Custom UI remains developer-owned, but official examples should model
  accessible patterns.

---

## ADR-0012: Separate Layout From Field Rendering

Date: TBD

Status: Accepted

### Context

The project must support grid, flex, stack, card, tabs, accordion, sections,
groups, divider layouts, and responsive behavior.

If field components directly own layout, forms become harder to customize and
harder to render consistently.

### Decision

Layout is schema-driven and handled by the layout engine and renderer.

Fields may declare layout metadata, but field components must not directly
control the overall form layout.

### Consequences

- Layout behavior can be changed without rewriting field components.
- The builder can generate layout schema.
- Themes can style layout without owning form behavior.
- Field renderer contracts stay focused on field value and field state.

---

## ADR-0013: Categorize Errors By Responsibility

Date: TBD

Status: Accepted

### Context

Errors may come from invalid schemas, validation failures, runtime problems,
plugin failures, rendering issues, or submission failures.

These categories require different debugging and user-display behavior.

### Decision

Errors will be categorized as:

- Schema errors.
- Validation errors.
- Runtime errors.
- Plugin errors.
- Rendering errors.
- Submission errors.

### Consequences

- Error objects must include type, message, optional code, optional field, cause,
  and metadata.
- Developer tooling can filter and present errors by category.
- Plugin failures can be isolated from validation and rendering failures.
- User-facing messages can remain safe while preserving debug metadata.

---

## ADR-0014: Defer Implementation Until Architecture And API Design Are Stable

Date: TBD

Status: Accepted

### Context

The roadmap defines Phase 0 as architecture and API design only.

The ecosystem has many packages and public API surfaces. Starting implementation
before agreeing on contracts could create churn and incompatible early choices.

### Decision

Phase 0 output is documentation only.

Implementation starts after core architecture, package responsibilities, public
APIs, schema design, validation adapters, plugin architecture, event lifecycle,
theme API, component override API, testing strategy, and release strategy are
documented.

### Consequences

- `SPEC.md` and ADRs become input to package scaffolding.
- Future implementation tasks should reference these documents.
- Open design items should be resolved before committing to stable public APIs.
- The project can still prototype, but prototypes must not be treated as stable
  contracts.

---

## ADR-0015: Use TypeScript-First Public Contracts

Date: TBD

Status: Accepted

### Context

The developer experience goal includes excellent TypeScript support,
predictable APIs, and minimal boilerplate.

Loose public types would make schema authoring, validation, component overrides,
and plugin development harder to use safely.

### Decision

All public APIs must be strongly typed with TypeScript.

Public contracts should avoid `any`. Extension points should use generics,
`unknown`, or explicit records where needed.

### Consequences

- Types become part of the public API.
- Schema, plugin, validation, event, and renderer contracts need type tests.
- Generic escape hatches are allowed where they preserve safety.
- Documentation should include TypeScript examples for each major API.

---

## ADR-0016: Treat Runtime Type Narrowing As A Required Boundary

Date: TBD

Status: Accepted

### Context

The form engine will accept schemas and options from JSON files, APIs,
databases, builder imports, plugins, and third-party validation libraries.

Those inputs are not guaranteed to match the TypeScript types at runtime.
Blindly asserting external data as `FormSchema`, plugin options, field values, or
validation errors would move failures into production.

### Decision

All untrusted external input must enter the system as `unknown` and be validated
or narrowed before use.

The codebase must avoid `any` in public APIs and implementation code. When an
external package forces unsafe typing, the unsafe boundary must be isolated
inside a local adapter that returns strongly typed project contracts.

Type guards, discriminated unions, generics, typed factories, and adapter
boundaries are the preferred mechanisms for narrowing data. Type assertions are
allowed only after validation or inside small adapter boundaries.

### Consequences

- Schema parsing must include runtime validation before returning `FormSchema`.
- Builder imports, API-loaded schemas, and database-loaded schemas cannot be
  trusted directly.
- Plugin option factories should preserve option types.
- Validation adapters must normalize third-party errors into `FormErrors`.
- Type-level tests must verify public API inference and prevent accidental
  widening to `any`.

---

## ADR-0017: Provide React Hook Form Style Controls Over Schema Forms

Date: 2026-07-05

Status: Accepted

### Context

React Hook Form is familiar to React developers for imperative form handling,
but it does not provide a first-class schema and visual-builder output model.

FormForge needs to serve both workflows:

- Developers should be able to call `useForm`, `register`, `handleSubmit`,
  `watch`, `setValue`, and `reset`.
- Builder-generated schemas should render without hand-writing every field.
- Custom components should still be replaceable by field type.

### Decision

The React package will expose an RHF-style hook API backed by the core
`FormEngine`, while preserving schema as the source of truth for builder-driven
forms.

The default React renderer must support common production field types including
text, textarea, number, email, phone, range, radio, select, multiselect, date,
time, password, URL, checkbox, switch, file, and image.

### Consequences

- The React package becomes a real runtime package, not only a typed facade.
- React is required as a peer dependency and as a package dev dependency for
  tests.
- Public React APIs must stay strongly typed and avoid `any`.
- The schema renderer and hook API must remain interoperable so users can mix
  generated fields with custom form markup.

---

## ADR-0018: Bundle Builder Field Definitions And Mutations In The Package

Date: 2026-07-05

Status: Accepted

### Context

If each consuming app must define field palettes, select/radio options,
checkbox modes, file accept types, range min/max settings, and date/time formats,
then the package is only a schema renderer and not a form builder solution.

The builder package should reduce repeated app work while still allowing custom
UI and custom field definitions.

### Decision

`@easy-form-builder/builder` owns the default builder field catalog,
field-specific settings, field creation helpers, immutable builder document
helpers, option helpers, metadata helpers, move/remove/select helpers, and
option support detection.

Apps can render their own builder UI, but the field behavior and schema mutation
operations should come from the package.

### Consequences

- Consumers can import bundled field definitions instead of duplicating builder
  rules.
- Select, radio, and checkbox fields ship with option management behavior.
- File, range, date, and time fields ship with type-specific metadata settings.
- The builder package becomes a real public API surface and needs tests and
  documentation alongside the core and React packages.
