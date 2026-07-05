# FormForge

Headless, schema-driven form builder engine for TypeScript and React.

FormForge is built around one core idea: every form becomes a strongly typed
schema. The framework-independent core owns state, validation, events, plugins,
submission, and schema parsing. React bindings, UI components, themes, and the
future visual builder are separate packages layered on top.

> Current status: early implementation scaffold. The core engine and React hooks
> are usable for schema-driven forms today. The default UI package and visual
> builder are still early surfaces.

## Packages

```text
@easy-form-builder/core
@easy-form-builder/react
@easy-form-builder/ui
@easy-form-builder/themes
@easy-form-builder/builder
```

| Package | Purpose |
| --- | --- |
| `@easy-form-builder/core` | Framework-independent schema parser, form engine, state, validation adapters, field registry, events, plugins, and submission lifecycle. |
| `@easy-form-builder/react` | React hooks and renderer: `useForm`, `register`, `handleSubmit`, `watch`, `Form`, providers, default field renderers, component overrides, slots, and themes. |
| `@easy-form-builder/ui` | Default accessible UI component package. Components are currently typed placeholders. |
| `@easy-form-builder/themes` | Theme contracts and official theme presets. |
| `@easy-form-builder/builder` | Builder field catalog, bundled field settings, document helpers, option helpers, and schema mutation utilities for visual form builders. |

## Installation

Use the packages you need:

```powershell
yarn add @easy-form-builder/core
yarn add @easy-form-builder/react react
```

For this monorepo checkout:

```powershell
yarn install
```

## Quick Start

```ts
import { createFormEngine } from "@easy-form-builder/core";
import type { FormSchema, FormValues } from "@easy-form-builder/core";

interface ContactValues extends FormValues {
  name: string;
  email: string;
}

const schema: FormSchema<ContactValues> = {
  id: "contact-form",
  fields: [
    {
      id: "name-field",
      name: "name",
      type: "text",
      label: "Name",
      defaultValue: "",
    },
    {
      id: "email-field",
      name: "email",
      type: "email",
      label: "Email",
      defaultValue: "",
    },
  ],
};

const form = createFormEngine<ContactValues>({
  schema,
  defaultValues: {
    name: "Ada",
  },
});

form.setValue("email", "ada@example.com");

console.log(form.getState().values);
```

## Schema API

Every form starts from `FormSchema`.

```ts
import type { FormSchema } from "@easy-form-builder/core";

const schema: FormSchema = {
  id: "signup",
  title: "Signup",
  description: "Create your account",
  layout: {
    type: "grid",
    columns: 12,
    gap: 16,
  },
  fields: [
    {
      id: "username",
      name: "username",
      type: "text",
      label: "Username",
      placeholder: "sourav",
      required: true,
      layout: {
        span: 6,
      },
    },
  ],
};
```

### `FormSchema`

```ts
interface FormSchema<TValues, TMeta> {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  version?: string;
  fields: FieldSchema[];
  layout?: LayoutSchema;
  sections?: SectionSchema[];
  steps?: StepSchema[];
  validation?: FormValidationSchema<TValues>;
  conditions?: ConditionSchema[];
  plugins?: PluginSchema[];
  submit?: SubmitSchema<TValues>;
  metadata?: TMeta;
}
```

### `FieldSchema`

```ts
interface FieldSchema<TType, TValue, TMeta> {
  id: string;
  name: string;
  type: TType;
  label?: string;
  description?: string;
  placeholder?: string;
  defaultValue?: TValue;
  required?: boolean;
  disabled?: boolean | ConditionExpression;
  readonly?: boolean | ConditionExpression;
  hidden?: boolean | ConditionExpression;
  validation?: ValidationRule[];
  layout?: FieldLayoutSchema;
  style?: FieldStyleSchema;
  options?: FieldOption[];
  metadata?: TMeta;
  events?: FieldEventHandlers;
  children?: FieldSchema[];
}
```

### Field Types

```text
text, textarea, number, email, password, phone, url
date, time, datetime
select, multiselect, radio, checkbox, switch
slider, rating, otp, signature
file, image, color, tags, currency, hidden, richtext
array, group, custom
```

## Loading External Schemas

Use `parseSchema` when loading schemas from JSON, APIs, databases, or builder
imports.

```ts
import { parseSchema } from "@easy-form-builder/core";

const input: unknown = await fetch("/api/form").then((res) => res.json());
const schema = parseSchema(input);
```

Invalid schema input throws a structured `FormBuilderError`.

## Core Engine

Create an engine:

```ts
import { createFormEngine } from "@easy-form-builder/core";

const form = createFormEngine({
  schema,
});
```

### Engine Options

```ts
interface FormEngineOptions<TValues> {
  schema: FormSchema<TValues>;
  defaultValues?: Partial<TValues>;
  validationAdapter?: ValidationAdapter<unknown, TValues>;
  plugins?: FormPlugin<Record<string, unknown>, TValues>[];
  registry?: FieldRegistry;
}
```

### Engine Methods

```ts
form.getState();
form.getSnapshot();
form.getValue("name");
form.setValue("name", "Ada");
form.setValues({ name: "Ada" });
form.reset();
form.touch("name");
form.focus("name");
form.blur("name");
await form.validate();
await form.validateField("name");
await form.submit();
form.subscribe((state) => {});
form.subscribeField("name", (fieldState) => {});
form.destroy();
```

## Form State

```ts
interface FormState<TValues> {
  values: TValues;
  initialValues: TValues;
  errors: FormErrors;
  touched: Record<string, boolean>;
  dirty: Record<string, boolean>;
  visited: Record<string, boolean>;
  focused: string | null;
  hidden: Record<string, boolean>;
  disabled: Record<string, boolean>;
  readonly: Record<string, boolean>;
  validating: boolean;
  submitting: boolean;
  submitted: boolean;
  submitCount: number;
  valid: boolean;
  loading: boolean;
}
```

## Subscriptions

Subscribe to whole-form state:

```ts
const unsubscribe = form.subscribe((state) => {
  console.log(state.values);
});

unsubscribe();
```

Subscribe to a field:

```ts
const unsubscribe = form.subscribeField("email", (field) => {
  console.log(field.value, field.errors);
});
```

## Validation

Validation is adapter-based. The core does not force Zod, Yup, Valibot, or any
other validation library.

```ts
import type { ValidationAdapter } from "@easy-form-builder/core";

const requiredEmailAdapter: ValidationAdapter<unknown, ContactValues> = {
  name: "required-email",
  validateForm(values) {
    if (values.email.length > 0) {
      return {
        valid: true,
        errors: {},
      };
    }

    return {
      valid: false,
      errors: {
        email: [
          {
            name: "email",
            message: "Email is required.",
            type: "required",
          },
        ],
      },
    };
  },
};

const form = createFormEngine<ContactValues>({
  schema,
  validationAdapter: requiredEmailAdapter,
});

const result = await form.validate();
```

## Submission

Add a submit handler to the schema:

```ts
const schema: FormSchema<ContactValues> = {
  id: "contact-form",
  fields: [],
  submit: {
    validateBeforeSubmit: true,
    async handler(values, context) {
      console.log(values, context.state);

      return {
        ok: true,
        data: {
          saved: true,
        },
      };
    },
  },
};

const result = await form.submit();
```

### Submit Result

```ts
interface SubmitResult<TData> {
  ok: boolean;
  data?: TData;
  errors?: FormErrors;
  message?: string;
  metadata?: Record<string, unknown>;
}
```

## Field Registry

Every field type resolves through a registry.

```ts
import { createFieldRegistry, createFormEngine } from "@easy-form-builder/core";

const registry = createFieldRegistry([
  {
    type: "text",
    schema: {
      label: "Text",
    },
  },
]);

const form = createFormEngine({
  schema,
  registry,
});

registry.register({ type: "custom-rating" });
registry.has("custom-rating");
registry.get("custom-rating");
registry.list();
registry.unregister("custom-rating");
```

## Events

```ts
import { createEventBus } from "@easy-form-builder/core";

const events = createEventBus<ContactValues>();

events.on("focus", ({ name }) => {
  console.log(`${name} focused`);
});

await events.emit("focus", {
  name: "email",
});
```

Available event names:

```text
init, load, mount, fieldRegister, focus, blur, change
validate, stepChange, submit, success, error, destroy
```

## Plugins

Plugins receive access to the engine, schema, events, and registry.

```ts
import type { FormPlugin } from "@easy-form-builder/core";

const autosavePlugin: FormPlugin = {
  name: "autosave",
  setup(context) {
    const unsubscribe = context.events.on("change", () => {
      const values = context.engine.getState().values;
      localStorage.setItem("draft", JSON.stringify(values));
    });

    return unsubscribe;
  },
};

const form = createFormEngine({
  schema,
  plugins: [autosavePlugin],
});
```

## Layout

Layouts are schema-driven.

```ts
const schema: FormSchema = {
  id: "profile",
  layout: {
    type: "grid",
    columns: 12,
    gap: 16,
  },
  fields: [
    {
      id: "first-name",
      name: "firstName",
      type: "text",
      layout: {
        span: 6,
      },
    },
    {
      id: "last-name",
      name: "lastName",
      type: "text",
      layout: {
        span: 6,
      },
    },
  ],
};
```

Supported layout names:

```text
grid, flex, stack, accordion, tabs, card, sections, groups, divider
```

## React API

The React package exposes an RHF-style API backed by the FormForge core engine:

```tsx
import { Form, useForm } from "@easy-form-builder/react";
```

```tsx
const form = useForm({
  schema,
  defaultValues: {
    email: "ada@example.com",
  },
});

const email = form.watch<string>("email");

return (
  <form onSubmit={form.handleSubmit(async (values) => ({ ok: true, data: values }))}>
    <input type="email" {...form.register("email")} />
    <button type="submit">Save</button>
  </form>
);
```

You can also render directly from schema:

```tsx
<Form schema={schema} defaultValues={defaults} onSubmit={saveLead} />
```

### `Form` Props

```ts
interface FormProps<TValues> {
  schema?: FormSchema<TValues>;
  form?: UseFormReturn<TValues>;
  children?: ReactNode | ((form: UseFormReturn<TValues>) => ReactNode);
  defaultValues?: Partial<TValues>;
  values?: Partial<TValues>;
  onValuesChange?(values: TValues, state: FormState<TValues>): void;
  onSubmit?: SubmitHandler<TValues>;
  onError?(error: unknown): void;
  validationAdapter?: ValidationAdapter<unknown, TValues>;
  plugins?: FormPlugin<Record<string, unknown>, TValues>[];
  components?: ComponentOverrideMap;
  slots?: SlotOverrideMap;
  theme?: FormTheme | string;
  disabled?: boolean;
  readonly?: boolean;
  className?: string;
  style?: CSSProperties;
  renderSubmitButton?: boolean;
  submitLabel?: ReactNode;
}
```

### `useForm` Options

```ts
interface UseFormOptions<TValues> {
  schema?: FormSchema<TValues>;
  defaultValues?: Partial<TValues>;
  validationAdapter?: ValidationAdapter<unknown, TValues>;
  plugins?: FormPlugin<Record<string, unknown>, TValues>[];
  onSubmit?: SubmitHandler<TValues>;
}
```

`useForm` returns `register`, `handleSubmit`, `setValue`, `getValue`, `watch`,
`validate`, `validateField`, `submit`, `reset`, `values`, `errors`, and
`formState`.

Default schema rendering supports `text`, `textarea`, `number`, `email`,
`phone`, `range`, `radio`, `select`, `multiselect`, `date`, `time`, `password`,
`url`, `checkbox`, `switch`, `file`, and `image` fields. Custom components can
replace any field type.

## Component Overrides

```tsx
<Form
  schema={schema}
  components={{
    text: TextInput,
    email: EmailInput,
  }}
/>
```

Each field component receives:

```ts
interface ReactFieldComponentProps<TValue, TField> {
  field: TField;
  value: TValue | undefined;
  state: FieldState<TValue>;
  register: RegisteredFieldProps;
  onChange(value: TValue): void;
  onBlur(): void;
  onFocus(): void;
  errorId?: string;
  describedBy?: string;
}
```

## Slots

```tsx
<Form
  schema={schema}
  slots={{
    FieldWrapper,
    Label,
    Error,
    SubmitButton,
  }}
/>
```

Available slots:

```text
FieldWrapper, Label, Description, Error, HelpText, SubmitButton, Layout
```

## Themes

Theme presets are exported from `@easy-form-builder/themes`.

```ts
import {
  bootstrapTheme,
  defaultTheme,
  minimalTheme,
  muiTheme,
  shadcnTheme,
  tailwindTheme,
} from "@easy-form-builder/themes";
```

```tsx
<Form schema={schema} theme={defaultTheme} />
```

Theme shape:

```ts
interface FormTheme {
  name: string;
  tokens?: Record<string, string | number>;
  components?: ComponentOverrideMap;
  slots?: SlotOverrideMap;
  classNames?: Record<string, string>;
  metadata?: Record<string, unknown>;
}
```

## Builder Helpers

The builder package includes a typed field catalog and immutable document
helpers. Apps do not need to reinvent select/radio/checkbox options, file accept
settings, range settings, or date/time format settings.

```ts
import {
  addBuilderField,
  addBuilderFieldOption,
  createBuilderDocument,
  getBuilderFieldDefinition,
  listBuilderFields,
  updateBuilderFieldMetadata,
} from "@easy-form-builder/builder";

const document = createBuilderDocument(schema);

const fields = listBuilderFields();
const selectDefinition = getBuilderFieldDefinition("select");

const withSelect = addBuilderField(document, "select");
const selectedFieldId = withSelect.selectedFieldId;

if (!selectedFieldId) {
  throw new Error("No selected field.");
}

const withOption = addBuilderFieldOption(withSelect, selectedFieldId, {
  label: "Enterprise",
  value: "enterprise",
});
const withFileTypes = updateBuilderFieldMetadata(withOption, "resume", {
  accept: ".pdf,.doc,.docx",
});
```

Builder output is still the same `FormSchema` consumed by the core engine and
React renderer.

## Type Safety

FormForge is designed to avoid `any`.

- Public APIs are generic and strongly typed.
- External input should enter as `unknown`.
- Use `parseSchema` before trusting JSON/API/builder-loaded schemas.
- Validation adapters normalize external validation errors into `FormErrors`.
- Metadata and plugin options use `Record<string, unknown>` unless stronger
  generics are provided.

## Development Commands

For contributors working in this repository:

```powershell
yarn install
yarn typecheck
yarn lint
yarn test
yarn build
```

Tests live in:

```text
packages/core/tests/
packages/react/tests/
packages/ui/tests/
packages/themes/tests/
packages/builder/tests/
```

Project/runtime notes were moved to `docs/PROJECT.md`.
