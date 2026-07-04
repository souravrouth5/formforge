# Architecture.md

# Form Builder Architecture

> **Version:** 1.0.0 (Draft)
>
> This document defines the architecture of the Form Builder ecosystem.
>
> It describes **how the project should be designed**, **why specific architectural decisions are made**, and **the principles every package should follow**.
>
> This document is considered the source of truth for the project's architecture.

---

# Table of Contents

1. Vision
2. Goals
3. Non-Goals
4. Core Principles
5. High-Level Architecture
6. Monorepo Structure
7. Package Responsibilities
8. System Layers
9. Rendering Pipeline
10. Data Flow
11. Form Lifecycle
12. Public APIs
13. Schema Specification
14. State Management
15. Field Registry
16. Layout Engine
17. Validation Architecture
18. Plugin Architecture
19. Event System
20. UI Customization
21. Theme System
22. Performance Strategy
23. Accessibility
24. Error Handling
25. Folder Structure
26. Testing Strategy
27. Coding Standards
28. Extension Guide
29. Future Roadmap

---

# 1. Vision

The goal is to build a **production-grade, headless, schema-driven Form Engine** for React applications.

The engine should be capable of powering:

* Contact forms
* Enterprise forms
* Survey builders
* CRM systems
* HR systems
* Medical forms
* Government forms
* Dynamic server-driven forms
* Multi-step workflows
* Drag & Drop builders

The project should never force a specific UI library.

Developers should have complete control over the appearance while the package manages:

* State
* Validation
* Rendering
* Conditional logic
* Arrays
* Events
* Submission
* Plugins

---

# 2. Goals

## Functional Goals

* Headless architecture
* Schema-first rendering
* JSX support
* Visual builder support
* Plugin system
* Theme system
* Field registry
* Dynamic layouts
* High performance
* Framework-independent core

---

## Developer Experience Goals

* Excellent TypeScript support
* Tree-shakeable packages
* Predictable APIs
* Minimal boilerplate
* Easy customization
* Excellent documentation

---

# 3. Non-Goals

The engine will NOT:

* Force Tailwind
* Force CSS
* Force Material UI
* Force shadcn/ui
* Force React Hook Form
* Force Zod
* Force Yup

Everything should be replaceable.

---

# 4. Core Principles

## Headless First

Business logic should never depend on UI.

---

## Schema Driven

Every form should ultimately become a schema.

Sources may include:

* JSON
* JSX
* Drag & Drop Builder
* Database
* API

Everything converges into a common schema.

---

## UI Agnostic

Developers own the UI.

The engine owns the logic.

---

## Framework Independent Core

The core package should not import React.

---

## Composition Over Configuration

Expose reusable building blocks instead of monolithic components.

---

## Plugin Based

New functionality should be added using plugins whenever possible.

---

## Performance First

Support forms containing thousands of fields.

---

## Type Safety

Everything should be strongly typed.

No `any`.

---

# 5. High-Level Architecture

```text
                Drag & Drop Builder
                        │
                        ▼
                 JSON Form Schema
                        │
                        ▼
                 Schema Parser
                        │
                        ▼
                 Form Engine (Core)
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
 Validation        State Engine     Plugin System
        │               │               │
        └───────────────┼───────────────┘
                        ▼
                 React Renderer
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
   Default UI      shadcn UI      Custom UI
```

---

# 6. Monorepo Structure

```text
form-builder/

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

---

# 7. Package Responsibilities

## core

Responsibilities:

* Form engine
* Schema parsing
* State
* Validation
* Registry
* Events
* Plugins
* Layout engine

No React imports.

---

## react

Responsibilities:

* React bindings
* Hooks
* Renderer
* Context
* Providers

---

## ui

Responsibilities:

* Default components
* Accessibility
* Base UI

---

## themes

Responsibilities:

* shadcn theme
* Material UI theme
* Bootstrap theme
* Tailwind theme

---

## builder

Responsibilities:

* Drag & Drop editor
* Property panel
* Canvas
* Export JSON

---

# 8. System Layers

```text
Application
      │
React Package
      │
Core Engine
      │
Utilities
```

Each layer only communicates with the layer below it.

---

# 9. Rendering Pipeline

Every form follows the same rendering process.

```text
Input Source

↓

Schema

↓

Parser

↓

Registry

↓

Layout Engine

↓

Renderer

↓

React Components

↓

User Interface
```

No component should bypass this pipeline.

---

# 10. Data Flow

```text
User Input

↓

Field

↓

State Engine

↓

Validation

↓

Plugins

↓

Events

↓

UI Update
```

The state engine is the single source of truth.

---

# 11. Form Lifecycle

```text
Create Form

↓

Load Schema

↓

Parse Schema

↓

Register Fields

↓

Initialize Plugins

↓

Initialize State

↓

Render

↓

User Interaction

↓

Validation

↓

Submission

↓

Cleanup
```

Every lifecycle step must be deterministic.

---

# 12. Public APIs

The project supports three primary APIs.

## Schema API

```tsx
<Form schema={schema} />
```

---

## JSX API

```tsx
<Form>

  <TextField />

  <DateField />

</Form>
```

---

## Builder API

```tsx
<Form schema={builderOutput} />
```

Internally all APIs produce the same schema.

---

# 13. Schema Specification

Every form follows a common schema.

```ts
FormSchema

↓

Layout

↓

Sections

↓

Fields

↓

Validation

↓

Plugins
```

Every field contains:

* id
* name
* type
* label
* placeholder
* description
* defaultValue
* validation
* layout
* metadata
* visibility
* disabled
* readonly
* events

No field should contain rendering logic.

---

# 14. State Management

The state engine manages:

* values
* errors
* touched
* dirty
* visited
* focused
* submission
* validation
* loading

UI components never own form state.

---

# 15. Field Registry

Every field must be registered.

Example:

```text
Text

↓

Registry

↓

Renderer
```

Supported fields include:

* Text
* Textarea
* Number
* Email
* Password
* Date
* Time
* Select
* Checkbox
* Radio
* Switch
* Slider
* File
* Image
* Rating
* Signature
* OTP
* Rich Text
* Tags
* Currency
* Custom

Developers may register additional field types.

---

# 16. Layout Engine

Supported layouts:

* Grid
* Flex
* Stack
* Accordion
* Tabs
* Card
* Sections
* Groups

Layouts are schema-driven.

No field should directly control layout.

---

# 17. Validation Architecture

Validation is adapter-based.

Supported adapters:

* Zod
* Yup
* Valibot
* Custom

Validation engines must expose a common interface.

The engine should never depend on a single validation library.

---

# 18. Plugin Architecture

Plugins extend behavior.

Examples:

* Autosave
* AI
* Analytics
* Drafts
* Undo
* Redo
* History
* Keyboard shortcuts

Plugins communicate only through the event system.

Plugins must not mutate UI directly.

---

# 19. Event System

Core lifecycle events include:

* onInit
* onMount
* onFieldRegister
* onFocus
* onBlur
* onChange
* onValidate
* onSubmit
* onSuccess
* onError
* onDestroy

Every plugin subscribes to these events.

---

# 20. UI Customization

Customization layers:

```text
Default UI

↓

Themes

↓

Components

↓

Slots

↓

Render Props

↓

CSS Variables
```

Developers should be able to replace every visual element.

---

# 21. Theme System

Themes define appearance only.

They never contain business logic.

Official themes:

* Default
* shadcn/ui
* Material UI
* Bootstrap
* Tailwind
* Minimal

---

# 22. Performance Strategy

The architecture must support:

* Lazy rendering
* Memoization
* Context splitting
* State isolation
* Virtualization
* Dynamic imports
* Minimal re-renders
* Field-level subscriptions

The renderer should only update fields whose state changed.

---

# 23. Accessibility

Every official component should support:

* ARIA
* Keyboard navigation
* Focus management
* Screen readers
* High contrast
* Reduced motion

Accessibility is a requirement, not an enhancement.

---

# 24. Error Handling

Errors should be categorized:

* Schema errors
* Validation errors
* Runtime errors
* Plugin errors
* Rendering errors

Errors should include useful debugging information without exposing internal implementation details.

---

# 25. Folder Structure

Example package structure:

```text
core/

engine/
schema/
registry/
validation/
plugins/
events/
layouts/
state/
types/
utils/
constants/
errors/
```

Every directory should have a single responsibility.

---

# 26. Testing Strategy

Testing levels:

## Unit Tests

* Schema parsing
* Validation
* Registry
* Utilities

## Integration Tests

* Rendering
* State
* Events
* Plugins

## End-to-End Tests

* Multi-step forms
* Arrays
* Conditional logic
* Submission

---

# 27. Coding Standards

* TypeScript only
* No `any`
* Small focused modules
* Pure functions where possible
* Dependency injection over global state
* Prefer composition over inheritance
* Public APIs must remain backward compatible whenever possible

---

# 28. Extension Guide

Adding a new field should follow the same process every time.

```text
Create Field Schema

↓

Register Field

↓

Implement Renderer

↓

Implement Validation

↓

Add Tests

↓

Add Documentation
```

No special cases.

Every field follows the same architecture.

---

# 29. Future Roadmap

Potential future capabilities:

* AI-generated forms
* AI-generated validation
* AI-generated conditional logic
* PDF generation
* PDF import
* JSON Schema support
* OpenAPI integration
* GraphQL integration
* REST integration
* Offline forms
* React Native renderer
* Vue renderer
* Angular renderer
* Svelte renderer
* Flutter renderer
* Mobile drag-and-drop builder

---

# Architecture Rules

Every contribution to this project must follow these rules:

1. The Core package must never depend on React.
2. Business logic must never depend on UI.
3. All forms must resolve to the same schema.
4. All rendering must go through the rendering pipeline.
5. Every feature should be extensible through plugins when appropriate.
6. Every visual element should be replaceable.
7. Every public API should be strongly typed.
8. Performance and accessibility are first-class concerns.
9. Backward compatibility should be maintained for stable APIs whenever possible.
10. Simplicity should be preferred over unnecessary abstraction.

---

# Final Philosophy

The goal is not to build another form library.

The goal is to build a **complete Form Engine ecosystem** that can power everything from a simple contact form to enterprise-grade dynamic form platforms.

The core engine should remain small, predictable, extensible, and framework-independent, while adapters, themes, plugins, and builders provide a rich developer experience without compromising flexibility.
