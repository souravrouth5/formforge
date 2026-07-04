# FormForge Project Notes

Production-grade, headless, schema-driven form builder ecosystem.

This repository follows the architecture in `docs/ARCHITECTURE.md`, the roadmap
in `docs/ROADMAP.md`, the technical contracts in `docs/SPEC.md`, and the
decision log in `docs/ADR.md`.

## Packages

- `@easy-form-builder/core`: framework-independent form engine.
- `@easy-form-builder/react`: React renderer and hooks.
- `@easy-form-builder/ui`: default accessible UI components.
- `@easy-form-builder/themes`: official theme contracts and presets.
- `@easy-form-builder/builder`: future drag-and-drop schema builder.

## Apps

- `apps/docs`: future documentation app.
- `apps/playground`: future live playground.

## Development

Install dependencies:

```powershell
yarn install
```

Run checks:

```powershell
yarn typecheck
yarn lint
yarn test
```

Build packages:

```powershell
yarn build
```

## Tests

Tests live in each package's `tests/` folder:

```text
packages/core/tests/
packages/react/tests/
packages/ui/tests/
packages/themes/tests/
packages/builder/tests/
```

Run all tests:

```powershell
yarn test
```

## Type Safety Policy

The implementation follows the project spec:

- No `any` in public APIs or implementation code.
- Untrusted data enters as `unknown`.
- Runtime type guards narrow schemas before use.
- Strict TypeScript compiler options are enabled.
- ESLint blocks explicit and unsafe `any` usage.

## Current Status

The repository has been initialized with:

- Yarn workspace monorepo configuration.
- Turborepo pipeline configuration.
- Strict shared TypeScript configuration.
- Initial package and app skeletons.
- Initial core contracts and form engine primitives.
- Placeholder React/UI/theme/builder entrypoints.

