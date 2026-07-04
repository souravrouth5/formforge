# Form Builder Technical Specification

> Version: 0.1.0 Draft
>
> Status: Design specification
>
> Source documents: `docs/ARCHITECTURE.md` and `docs/ROADMAP.md`

This document defines the public contracts for the Form Builder ecosystem: APIs,
schemas, TypeScript types, package boundaries, interfaces, lifecycle hooks,
events, validation adapters, plugins, rendering contracts, and customization
points.

The specification is intentionally implementation-ready, but it does not require
any production code to exist yet.

---

## 1. Scope

The project is a production-grade, headless, schema-driven form engine ecosystem
for React applications, with a framework-independent core.

The system must support:

- JSON/schema-driven forms.
- JSX-authored forms.
- Future drag-and-drop builder output.
- Complete UI replacement.
- Validation adapters.
- Plugin-based behavior.
- Theme and component override APIs.
- Enterprise-scale forms, including conditional logic, arrays, multi-step forms,
  and large field counts.

The system must not force:

- Tailwind.
- CSS framework choices.
- Material UI, shadcn/ui, Chakra UI, Bootstrap, Ant Design, or any other design
  system.
- React Hook Form.
- Zod, Yup, Valibot, or any other validation library.

---

## 2. Package Contracts

### 2.1 Package Names

Final package names may change, but package responsibility boundaries must stay
stable.

```text
@your-org/form-core
@your-org/form-react
@your-org/form-ui
@your-org/form-themes
@your-org/form-builder
@your-org/form-playground
@your-org/form-docs
```

### 2.2 `@your-org/form-core`

Framework-independent form engine.

Must not import React.

Exports:

```ts
export type {
  FormSchema,
  FieldSchema,
  LayoutSchema,
  ValidationRule,
  ValidationAdapter,
  FormState,
  FormValues,
  FormErrors,
  FieldState,
  FieldRegistry,
  FieldDefinition,
  FormPlugin,
  FormEvent,
  FormEventName,
  FormEventMap,
  FormEngine,
  FormEngineOptions,
  FormEngineSnapshot,
};

export {
  createFormEngine,
  createFieldRegistry,
  createEventBus,
  createPluginManager,
  createValidationManager,
  parseSchema,
  normalizeSchema,
};
```

Responsibilities:

- Schema parsing and normalization.
- State management.
- Field registry.
- Validation adapter orchestration.
- Event bus.
- Plugin manager.
- Layout model.
- Submission lifecycle.
- Error model.

### 2.3 `@your-org/form-react`

React renderer and bindings.

Exports:

```ts
export {
  Form,
  FormProvider,
  FieldRenderer,
  LayoutRenderer,
  useForm,
  useField,
  useWatch,
  useFormContext,
  useFormState,
};

export type {
  FormProps,
  FormProviderProps,
  FieldRendererProps,
  LayoutRendererProps,
  UseFormOptions,
  UseFormReturn,
  UseFieldOptions,
  UseFieldReturn,
  UseWatchOptions,
};
```

Responsibilities:

- React context.
- Hooks.
- Schema-to-component rendering.
- JSX API conversion to schema.
- Field-level subscriptions.
- Component and slot resolution.

### 2.4 `@your-org/form-ui`

Default accessible UI components.

Exports:

```ts
export {
  Input,
  Textarea,
  Select,
  Checkbox,
  RadioGroup,
  Switch,
  Slider,
  DatePicker,
  TimePicker,
  FileUpload,
  Rating,
  OtpInput,
  Label,
  ErrorMessage,
  FieldWrapper,
  SubmitButton,
};
```

Responsibilities:

- Default UI components.
- Accessibility behavior.
- Keyboard behavior.
- Base visual structure.

This package must not contain business logic.

### 2.5 `@your-org/form-themes`

Official themes.

Exports:

```ts
export {
  defaultTheme,
  minimalTheme,
  shadcnTheme,
  muiTheme,
  bootstrapTheme,
  tailwindTheme,
};

export type {
  FormTheme,
  ThemeTokenMap,
  ThemeComponentMap,
};
```

Responsibilities:

- Theme tokens.
- Component mappings.
- Slot defaults.
- Appearance-only configuration.

Themes must not contain validation, state, lifecycle, or submission logic.

### 2.6 `@your-org/form-builder`

Future visual drag-and-drop builder.

Responsibilities:

- Canvas.
- Field palette.
- Layers panel.
- Property editor.
- Undo/redo.
- Import/export.
- Schema generation.

The builder only emits `FormSchema`. It must not create a separate runtime form
format.

---

## 3. Core Schema Model

All input APIs must normalize to `FormSchema`.

```ts
export interface FormSchema<
  TValues extends FormValues = FormValues,
  TMeta extends Record<string, unknown> = Record<string, unknown>,
> {
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

### 3.1 Form Values

```ts
export type PrimitiveValue = string | number | boolean | null;

export type FieldValue =
  | PrimitiveValue
  | PrimitiveValue[]
  | FileValue
  | FileValue[]
  | Record<string, unknown>
  | Record<string, unknown>[];

export type FormValues = Record<string, FieldValue>;
```

### 3.2 Field Schema

```ts
export interface FieldSchema<
  TType extends FieldType = FieldType,
  TValue = FieldValue,
  TMeta extends Record<string, unknown> = Record<string, unknown>,
> {
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

Rules:

- `id` must be unique within a form.
- `name` must be unique unless the field intentionally belongs to an array or
  group namespace.
- `type` must resolve through the field registry.
- Rendering logic must not be embedded in field schemas.
- Unknown field properties are not allowed in stable schemas. Use `metadata` for
  extension data.

### 3.3 Field Types

```ts
export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "password"
  | "phone"
  | "url"
  | "date"
  | "time"
  | "datetime"
  | "select"
  | "multiselect"
  | "radio"
  | "checkbox"
  | "switch"
  | "slider"
  | "rating"
  | "otp"
  | "signature"
  | "file"
  | "image"
  | "color"
  | "tags"
  | "currency"
  | "hidden"
  | "richtext"
  | "array"
  | "group"
  | "custom";
```

### 3.4 Field Options

```ts
export interface FieldOption<TValue = string> {
  label: string;
  value: TValue;
  description?: string;
  disabled?: boolean;
  metadata?: Record<string, unknown>;
}
```

### 3.5 File Values

```ts
export interface FileValue {
  id?: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  file?: File;
  metadata?: Record<string, unknown>;
}
```

### 3.6 Sections

```ts
export interface SectionSchema {
  id: string;
  title?: string;
  description?: string;
  fields: string[];
  layout?: LayoutSchema;
  hidden?: boolean | ConditionExpression;
  metadata?: Record<string, unknown>;
}
```

`fields` references field IDs.

### 3.7 Steps

```ts
export interface StepSchema {
  id: string;
  title?: string;
  description?: string;
  fields?: string[];
  sections?: string[];
  validation?: ValidationRule[];
  hidden?: boolean | ConditionExpression;
  metadata?: Record<string, unknown>;
}
```

Steps may reference field IDs or section IDs.

---

## 4. Layout Specification

### 4.1 Layout Schema

```ts
export type LayoutType =
  | "grid"
  | "flex"
  | "stack"
  | "accordion"
  | "tabs"
  | "card"
  | "sections"
  | "groups"
  | "divider";

export interface LayoutSchema {
  type?: LayoutType;
  columns?: number;
  gap?: number | string;
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  responsive?: ResponsiveLayoutSchema;
  metadata?: Record<string, unknown>;
}
```

### 4.2 Field Layout

```ts
export interface FieldLayoutSchema {
  span?: number;
  rowSpan?: number;
  order?: number;
  width?: number | string;
  minWidth?: number | string;
  maxWidth?: number | string;
  responsive?: ResponsiveFieldLayoutSchema;
}
```

### 4.3 Responsive Layout

```ts
export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

export type ResponsiveLayoutSchema = Partial<Record<Breakpoint, LayoutSchema>>;

export type ResponsiveFieldLayoutSchema = Partial<
  Record<Breakpoint, FieldLayoutSchema>
>;
```

Layout belongs to schema and layout engines, not field renderers.

---

## 5. Validation Specification

Validation is adapter-based.

### 5.1 Validation Rule

```ts
export interface ValidationRule<TValue = FieldValue> {
  type: string;
  message?: string;
  value?: unknown;
  when?: ConditionExpression;
  metadata?: Record<string, unknown>;
  validate?: CustomValidationFunction<TValue>;
}
```

Built-in rule names:

```ts
export type BuiltInValidationRule =
  | "required"
  | "min"
  | "max"
  | "minLength"
  | "maxLength"
  | "pattern"
  | "email"
  | "url"
  | "integer"
  | "positive"
  | "dateMin"
  | "dateMax"
  | "fileSize"
  | "fileType"
  | "custom";
```

### 5.2 Validation Adapter

```ts
export interface ValidationAdapter<
  TSchema = unknown,
  TValues extends FormValues = FormValues,
> {
  name: string;
  createSchema?(form: FormSchema<TValues>): TSchema;
  validateForm(
    values: TValues,
    context: ValidationContext<TValues>,
  ): Promise<ValidationResult> | ValidationResult;
  validateField?(
    name: string,
    value: FieldValue,
    context: ValidationContext<TValues>,
  ): Promise<FieldValidationResult> | FieldValidationResult;
}
```

### 5.3 Validation Context

```ts
export interface ValidationContext<TValues extends FormValues = FormValues> {
  schema: FormSchema<TValues>;
  values: TValues;
  field?: FieldSchema;
  state: FormState<TValues>;
  signal?: AbortSignal;
}
```

### 5.4 Validation Results

```ts
export interface ValidationResult {
  valid: boolean;
  errors: FormErrors;
}

export interface FieldValidationResult {
  valid: boolean;
  error?: FieldError;
}

export interface FieldError {
  name: string;
  message: string;
  type?: string;
  code?: string;
  metadata?: Record<string, unknown>;
}

export type FormErrors = Record<string, FieldError[]>;
```

Validation adapters must be replaceable. The core package may provide a custom
rule adapter, but must not require one external validation library.

---

## 6. Conditional Logic Specification

### 6.1 Condition Schema

```ts
export interface ConditionSchema {
  id: string;
  target: string;
  effect: ConditionEffect;
  expression: ConditionExpression;
  metadata?: Record<string, unknown>;
}

export type ConditionEffect =
  | "show"
  | "hide"
  | "enable"
  | "disable"
  | "readonly"
  | "editable"
  | "required"
  | "optional"
  | "setValue"
  | "clearValue";
```

### 6.2 Expressions

```ts
export type ConditionExpression =
  | FieldComparisonExpression
  | LogicalConditionExpression
  | CustomConditionExpression;

export interface FieldComparisonExpression {
  field: string;
  operator:
    | "eq"
    | "neq"
    | "gt"
    | "gte"
    | "lt"
    | "lte"
    | "contains"
    | "notContains"
    | "empty"
    | "notEmpty";
  value?: unknown;
}

export interface LogicalConditionExpression {
  and?: ConditionExpression[];
  or?: ConditionExpression[];
  not?: ConditionExpression;
}

export interface CustomConditionExpression {
  type: "custom";
  name: string;
  metadata?: Record<string, unknown>;
}
```

Conditions must be deterministic and evaluated from the current form state.

---

## 7. State Management Specification

The state engine is the single source of truth.

### 7.1 Form State

```ts
export interface FormState<TValues extends FormValues = FormValues> {
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

### 7.2 Field State

```ts
export interface FieldState<TValue = FieldValue> {
  name: string;
  value: TValue;
  initialValue?: TValue;
  errors: FieldError[];
  touched: boolean;
  dirty: boolean;
  visited: boolean;
  focused: boolean;
  hidden: boolean;
  disabled: boolean;
  readonly: boolean;
  validating: boolean;
}
```

### 7.3 State Actions

```ts
export interface FormEngine<TValues extends FormValues = FormValues> {
  getState(): FormState<TValues>;
  getSnapshot(): FormEngineSnapshot<TValues>;
  getValue<TValue = FieldValue>(name: string): TValue | undefined;
  setValue<TValue = FieldValue>(name: string, value: TValue): void;
  setValues(values: Partial<TValues>): void;
  reset(values?: Partial<TValues>): void;
  touch(name: string): void;
  focus(name: string): void;
  blur(name: string): void;
  validate(): Promise<ValidationResult>;
  validateField(name: string): Promise<FieldValidationResult>;
  submit(): Promise<SubmitResult>;
  subscribe(listener: FormStateListener<TValues>): Unsubscribe;
  subscribeField(name: string, listener: FieldStateListener): Unsubscribe;
  destroy(): void;
}
```

### 7.4 Listeners

```ts
export type Unsubscribe = () => void;

export type FormStateListener<TValues extends FormValues = FormValues> = (
  state: FormState<TValues>,
) => void;

export type FieldStateListener = (state: FieldState) => void;
```

The renderer should subscribe at the smallest practical scope, usually at field
level, to avoid unnecessary re-renders.

---

## 8. Field Registry Specification

Every renderable field type must be registered.

```ts
export interface FieldRegistry {
  register(definition: FieldDefinition): void;
  unregister(type: string): void;
  has(type: string): boolean;
  get(type: string): FieldDefinition | undefined;
  list(): FieldDefinition[];
}
```

```ts
export interface FieldDefinition<
  TSchema extends FieldSchema = FieldSchema,
  TValue = FieldValue,
> {
  type: string;
  schema?: FieldDefinitionSchema;
  normalize?(field: TSchema): TSchema;
  getDefaultValue?(field: TSchema): TValue;
  validate?(
    value: TValue,
    field: TSchema,
    context: ValidationContext,
  ): Promise<FieldValidationResult> | FieldValidationResult;
  metadata?: Record<string, unknown>;
}
```

React renderers are registered separately from core field definitions.

```ts
export interface ReactFieldComponentProps<
  TValue = FieldValue,
  TField extends FieldSchema = FieldSchema,
> {
  field: TField;
  value: TValue;
  state: FieldState<TValue>;
  onChange(value: TValue): void;
  onBlur(): void;
  onFocus(): void;
  errorId?: string;
  describedBy?: string;
}
```

```ts
export type ReactFieldComponent<
  TValue = FieldValue,
  TField extends FieldSchema = FieldSchema,
> = React.ComponentType<ReactFieldComponentProps<TValue, TField>>;
```

---

## 9. Event System Specification

Plugins, adapters, and host applications communicate through events.

### 9.1 Event Names

```ts
export type FormEventName =
  | "init"
  | "load"
  | "mount"
  | "fieldRegister"
  | "focus"
  | "blur"
  | "change"
  | "validate"
  | "stepChange"
  | "submit"
  | "success"
  | "error"
  | "destroy";
```

### 9.2 Event Map

```ts
export interface FormEventMap<TValues extends FormValues = FormValues> {
  init: { engine: FormEngine<TValues> };
  load: { schema: FormSchema<TValues> };
  mount: { engine: FormEngine<TValues> };
  fieldRegister: { field: FieldSchema };
  focus: { name: string };
  blur: { name: string };
  change: { name: string; value: FieldValue; previousValue: FieldValue };
  validate: { result: ValidationResult };
  stepChange: { from?: string; to: string };
  submit: { values: TValues };
  success: { result: SubmitResult };
  error: { error: FormError };
  destroy: { engine: FormEngine<TValues> };
}
```

### 9.3 Event Bus

```ts
export interface EventBus<TValues extends FormValues = FormValues> {
  on<TName extends FormEventName>(
    name: TName,
    handler: FormEventHandler<TName, TValues>,
  ): Unsubscribe;
  once<TName extends FormEventName>(
    name: TName,
    handler: FormEventHandler<TName, TValues>,
  ): Unsubscribe;
  emit<TName extends FormEventName>(
    name: TName,
    payload: FormEventMap<TValues>[TName],
  ): void | Promise<void>;
}
```

```ts
export type FormEventHandler<
  TName extends FormEventName,
  TValues extends FormValues = FormValues,
> = (payload: FormEventMap<TValues>[TName]) => void | Promise<void>;
```

Event handlers must not mutate UI directly. UI changes must happen through
state, schema, component props, or host application code.

---

## 10. Plugin Specification

Plugins extend behavior through lifecycle hooks and events.

```ts
export interface FormPlugin<
  TOptions extends Record<string, unknown> = Record<string, unknown>,
  TValues extends FormValues = FormValues,
> {
  name: string;
  version?: string;
  options?: TOptions;
  setup(context: PluginContext<TValues>): void | PluginCleanup;
}
```

```ts
export interface PluginContext<TValues extends FormValues = FormValues> {
  schema: FormSchema<TValues>;
  engine: FormEngine<TValues>;
  events: EventBus<TValues>;
  registry: FieldRegistry;
  metadata?: Record<string, unknown>;
}
```

```ts
export type PluginCleanup = () => void | Promise<void>;
```

Schema representation:

```ts
export interface PluginSchema {
  name: string;
  enabled?: boolean;
  options?: Record<string, unknown>;
}
```

Plugin rules:

- Plugins communicate through the event system.
- Plugins must not mutate UI directly.
- Plugins must return cleanup behavior when subscribing to external resources.
- Plugin failures must be reported as plugin errors.

Expected plugin categories:

- Autosave.
- Analytics.
- Drafts.
- Undo/redo.
- History.
- Keyboard shortcuts.
- AI-assisted form generation.
- Custom business behavior.

---

## 11. Submission Specification

### 11.1 Submit Schema

```ts
export interface SubmitSchema<TValues extends FormValues = FormValues> {
  mode?: "manual" | "native" | "async";
  validateBeforeSubmit?: boolean;
  resetOnSuccess?: boolean;
  handler?: SubmitHandler<TValues>;
  metadata?: Record<string, unknown>;
}
```

### 11.2 Submit Handler

```ts
export type SubmitHandler<TValues extends FormValues = FormValues> = (
  values: TValues,
  context: SubmitContext<TValues>,
) => Promise<SubmitResult> | SubmitResult;
```

```ts
export interface SubmitContext<TValues extends FormValues = FormValues> {
  schema: FormSchema<TValues>;
  state: FormState<TValues>;
  engine: FormEngine<TValues>;
  signal?: AbortSignal;
}
```

### 11.3 Submit Result

```ts
export interface SubmitResult<TData = unknown> {
  ok: boolean;
  data?: TData;
  errors?: FormErrors;
  message?: string;
  metadata?: Record<string, unknown>;
}
```

---

## 12. React API Specification

### 12.1 Schema API

```tsx
<Form schema={schema} />
```

```ts
export interface FormProps<TValues extends FormValues = FormValues> {
  schema?: FormSchema<TValues>;
  children?: React.ReactNode;
  defaultValues?: Partial<TValues>;
  values?: Partial<TValues>;
  onValuesChange?(values: TValues, state: FormState<TValues>): void;
  onSubmit?: SubmitHandler<TValues>;
  onError?(error: FormError): void;
  validationAdapter?: ValidationAdapter<unknown, TValues>;
  plugins?: FormPlugin<Record<string, unknown>, TValues>[];
  components?: ComponentOverrideMap;
  slots?: SlotOverrideMap;
  theme?: FormTheme | string;
  registry?: FieldRegistry;
  disabled?: boolean;
  readonly?: boolean;
  className?: string;
  style?: React.CSSProperties;
}
```

### 12.2 JSX API

```tsx
<Form>
  <TextField name="name" label="Name" />
  <NumberField name="age" label="Age" />
  <DateField name="dob" label="Date of birth" />
</Form>
```

JSX field components must produce schema internally. The resulting schema must
be equivalent to schema authored directly with `FormSchema`.

```ts
export interface JSXFieldProps<TValue = FieldValue> {
  id?: string;
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
  defaultValue?: TValue;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  hidden?: boolean;
  validation?: ValidationRule[];
  layout?: FieldLayoutSchema;
  metadata?: Record<string, unknown>;
}
```

### 12.3 Builder API

The builder outputs schema:

```tsx
<Form schema={builderOutput} />
```

Builder output must not require a separate renderer.

### 12.4 `useForm`

```ts
export interface UseFormOptions<TValues extends FormValues = FormValues> {
  schema?: FormSchema<TValues>;
  defaultValues?: Partial<TValues>;
  validationAdapter?: ValidationAdapter<unknown, TValues>;
  plugins?: FormPlugin<Record<string, unknown>, TValues>[];
  registry?: FieldRegistry;
}
```

```ts
export interface UseFormReturn<TValues extends FormValues = FormValues> {
  engine: FormEngine<TValues>;
  state: FormState<TValues>;
  values: TValues;
  errors: FormErrors;
  setValue<TValue = FieldValue>(name: string, value: TValue): void;
  getValue<TValue = FieldValue>(name: string): TValue | undefined;
  validate(): Promise<ValidationResult>;
  submit(): Promise<SubmitResult>;
  reset(values?: Partial<TValues>): void;
}
```

### 12.5 `useField`

```ts
export interface UseFieldOptions<TValue = FieldValue> {
  name: string;
  defaultValue?: TValue;
}
```

```ts
export interface UseFieldReturn<TValue = FieldValue> {
  value: TValue | undefined;
  state: FieldState<TValue>;
  errors: FieldError[];
  setValue(value: TValue): void;
  onChange(value: TValue): void;
  onBlur(): void;
  onFocus(): void;
}
```

### 12.6 `useWatch`

```ts
export interface UseWatchOptions {
  name?: string | string[];
}
```

```ts
export type UseWatchReturn<TValues extends FormValues = FormValues> =
  | FieldValue
  | Partial<TValues>
  | undefined;
```

### 12.7 `FormProvider`

```tsx
<FormProvider form={form}>{children}</FormProvider>
```

```ts
export interface FormProviderProps<TValues extends FormValues = FormValues> {
  form: UseFormReturn<TValues> | FormEngine<TValues>;
  children: React.ReactNode;
}
```

### 12.8 `FieldRenderer`

```ts
export interface FieldRendererProps {
  field: FieldSchema;
}
```

`FieldRenderer` must:

- Resolve the field definition from the registry.
- Resolve the React component from overrides, theme, or default UI.
- Bind field state and events.
- Render accessibility attributes.
- Render errors through the configured slot.

---

## 13. Component Override Specification

### 13.1 Component Overrides

```ts
export type ComponentOverrideMap = Partial<
  Record<FieldType | string, ReactFieldComponent>
>;
```

Example:

```tsx
<Form
  components={{
    text: Input,
    date: Calendar,
    slider: Slider,
  }}
/>
```

### 13.2 Slot Overrides

```ts
export interface SlotOverrideMap {
  FieldWrapper?: React.ComponentType<FieldWrapperProps>;
  Label?: React.ComponentType<LabelProps>;
  Description?: React.ComponentType<DescriptionProps>;
  Error?: React.ComponentType<ErrorProps>;
  HelpText?: React.ComponentType<HelpTextProps>;
  SubmitButton?: React.ComponentType<SubmitButtonProps>;
  Layout?: React.ComponentType<LayoutRendererProps>;
}
```

```ts
export interface FieldWrapperProps {
  field: FieldSchema;
  state: FieldState;
  children: React.ReactNode;
}

export interface LabelProps {
  field: FieldSchema;
  htmlFor?: string;
}

export interface ErrorProps {
  field: FieldSchema;
  errors: FieldError[];
}
```

Resolution order:

1. Explicit `components` / `slots` prop.
2. Theme components / slots.
3. Default UI package.
4. Registry fallback.

---

## 14. Theme Specification

```ts
export interface FormTheme {
  name: string;
  tokens?: ThemeTokenMap;
  components?: ComponentOverrideMap;
  slots?: SlotOverrideMap;
  classNames?: ThemeClassNameMap;
  metadata?: Record<string, unknown>;
}
```

```ts
export type ThemeTokenMap = Record<string, string | number>;

export type ThemeClassNameMap = Record<string, string>;

export type ThemeComponentMap = ComponentOverrideMap;
```

Themes define appearance only. They must not change validation, submission, or
state behavior.

---

## 15. Error Specification

```ts
export type FormErrorType =
  | "schema"
  | "validation"
  | "runtime"
  | "plugin"
  | "rendering"
  | "submission";
```

```ts
export interface FormError {
  type: FormErrorType;
  message: string;
  code?: string;
  field?: string;
  cause?: unknown;
  metadata?: Record<string, unknown>;
}
```

Error requirements:

- Schema errors must identify invalid paths where possible.
- Validation errors must be field-addressable.
- Plugin errors must include plugin names when available.
- Rendering errors must not expose irrelevant internals to end users.
- Debug metadata may be included for developer tooling.

---

## 16. Rendering Pipeline

Every form must follow this pipeline:

```text
Input Source
-> Schema
-> Parser
-> Registry
-> Layout Engine
-> Renderer
-> UI Components
```

No component may bypass schema normalization, field registry lookup, or state
binding.

Renderer responsibilities:

- Normalize schema input.
- Register field definitions.
- Initialize plugins.
- Initialize state.
- Resolve layouts.
- Resolve components and slots.
- Subscribe to state updates.
- Render only affected fields where practical.
- Clean up subscriptions and plugins on destroy.

---

## 17. Lifecycle

Deterministic lifecycle:

```text
Create Form
-> Load Schema
-> Parse Schema
-> Register Fields
-> Initialize Plugins
-> Initialize State
-> Render
-> User Interaction
-> Validation
-> Submission
-> Cleanup
```

Required lifecycle events:

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

---

## 18. Accessibility Requirements

Official UI components must support:

- ARIA labels and relationships.
- Keyboard navigation.
- Focus management.
- Screen readers.
- High contrast.
- Reduced motion.
- Error message association.
- Required and invalid state announcements.

Field renderers must expose stable IDs for labels, descriptions, and errors.

---

## 19. Performance Requirements

The architecture must support forms with 1000+ fields.

Required strategies:

- Field-level subscriptions.
- Context splitting.
- Memoized renderers.
- Lazy rendering.
- Virtualization for large sections and arrays.
- Dynamic imports for heavy fields.
- State isolation.
- Minimal re-renders.

Acceptance target:

- Updating one field should not require re-rendering every field.
- Hidden or inactive steps should be eligible for lazy rendering.
- Large arrays should support virtualization or incremental rendering.

---

## 20. Testing Requirements

### 20.1 Unit Tests

Must cover:

- Schema parsing.
- Schema normalization.
- Validation rules.
- Validation adapters.
- Registry operations.
- Event bus.
- State transitions.
- Utility functions.

### 20.2 Integration Tests

Must cover:

- Rendering from schema.
- Rendering from JSX.
- Field state updates.
- Plugin lifecycle.
- Event dispatch.
- Component overrides.
- Theme resolution.
- Layout rendering.

### 20.3 End-to-End Tests

Must cover:

- Multi-step forms.
- Conditional logic.
- Arrays/repeaters.
- Submission.
- Validation error flows.
- Import/export through future builder.

---

## 21. Release and Compatibility

Stable public APIs should remain backward compatible whenever practical.

Breaking changes must:

- Be documented.
- Include migration guidance.
- Be released through the versioning system.
- Avoid silent behavior changes.

Recommended release tooling:

- Changesets.
- CI validation.
- Package-level builds through Turborepo.

---

## 22. Type Safety And Runtime Narrowing

The project must be TypeScript-first and must not rely on `any` for public
contracts or internal implementation shortcuts.

### 22.1 Type Policy

Required rules:

- Public APIs must not expose `any`.
- Internal code must not introduce `any` except where a third-party type forces
  it, and that exception must be isolated behind a typed adapter.
- Untrusted input must enter the system as `unknown`.
- Schema parsing must validate and narrow `unknown` into `FormSchema`.
- Plugin options must use generics or `Record<string, unknown>`.
- Metadata must use `Record<string, unknown>` unless a package defines a
  stronger generic metadata type.
- Type assertions must be treated as unsafe and limited to validated boundaries.
- Type guards, discriminated unions, overloads, and generics are preferred over
  assertions.

### 22.2 Unknown Input Boundary

External data sources include:

- JSON schema imports.
- Builder import files.
- API responses.
- Database-loaded form definitions.
- Plugin option payloads.
- Validation-library error payloads.

These sources must be parsed from `unknown`.

```ts
export function parseSchema(input: unknown): FormSchema {
  if (!isFormSchema(input)) {
    throw createSchemaError("Invalid form schema");
  }

  return normalizeSchema(input);
}
```

### 22.3 Type Guards

Runtime type guards are required before narrowing untrusted data.

```ts
export function isFormSchema(value: unknown): value is FormSchema {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    Array.isArray(value.fields) &&
    value.fields.every(isFieldSchema)
  );
}
```

```ts
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
```

### 22.4 Field Type Narrowing

Field schemas must use discriminated unions when field-specific properties are
needed.

```ts
export interface TextFieldSchema extends FieldSchema<"text", string> {
  minLength?: number;
  maxLength?: number;
}

export interface SelectFieldSchema<TValue = string>
  extends FieldSchema<"select", TValue> {
  options: FieldOption<TValue>[];
}

export type BuiltInFieldSchema =
  | TextFieldSchema
  | SelectFieldSchema
  | FieldSchema;
```

Consumers must narrow by `field.type`.

```ts
export function getFieldDefaultValue(field: FieldSchema): FieldValue {
  switch (field.type) {
    case "text":
    case "email":
    case "password":
      return field.defaultValue ?? "";
    case "checkbox":
    case "switch":
      return field.defaultValue ?? false;
    default:
      return field.defaultValue ?? null;
  }
}
```

### 22.5 Plugin Option Typing

Plugins must type their own options through generics.

```ts
export interface AutosavePluginOptions {
  intervalMs: number;
  storageKey: string;
}

export type AutosavePlugin = FormPlugin<AutosavePluginOptions>;
```

Plugin hosts should preserve the option type instead of widening it.

```ts
export function createAutosavePlugin(
  options: AutosavePluginOptions,
): AutosavePlugin {
  return {
    name: "autosave",
    options,
    setup(context) {
      context.events.on("change", () => {
        // Persist through a typed implementation.
      });
    },
  };
}
```

### 22.6 Validation Adapter Typing

Validation adapters may wrap libraries with unknown internal schemas, but the
adapter boundary must stay typed.

```ts
export interface ZodValidationAdapter<TValues extends FormValues>
  extends ValidationAdapter<unknown, TValues> {
  name: "zod";
}
```

Adapter implementations must convert external errors into `FormErrors` before
returning them to the engine.

### 22.7 Assertion Policy

Allowed assertion cases:

- Narrowing after a successful runtime validator.
- Bridging a third-party package with incomplete types inside a local adapter.
- Preserving generic inference where TypeScript cannot express the constraint.

Disallowed assertion cases:

- Skipping schema validation.
- Casting plugin options without a validator or factory.
- Casting field values without checking the field type.
- Casting event payloads instead of using the typed event map.

When an assertion is unavoidable, it must be local, documented with a short
comment, and hidden behind a strongly typed function.

### 22.8 Type-Level Test Requirements

The project must include type-level tests for public contracts before stable
release.

Required coverage:

- `FormSchema<TValues>` preserves value types.
- `useForm<TValues>()` returns typed values and setters.
- `useField<TValue>()` preserves field value type.
- Event payloads are narrowed by event name.
- Plugin options remain typed.
- Component override props match field value and schema types.
- Validation adapters return normalized `FormErrors`.

Recommended tools:

- `tsc --noEmit`.
- `tsd` or `expect-type`.
- Strict TypeScript compiler options.

Required compiler posture:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

---

## 23. Coding Standards

Required standards:

- TypeScript only.
- No `any` in public APIs or implementation code.
- Parse untrusted data as `unknown` and narrow it before use.
- Prefer type guards and discriminated unions over type assertions.
- Small focused modules.
- Pure functions where practical.
- Dependency injection over global mutable state.
- Composition over inheritance.
- Core package must not depend on React.
- UI packages must not own business logic.
- Public APIs must be strongly typed.

---

## 24. Open Design Items

These items are intentionally left for future refinement:

- Exact package scope name.
- Exact schema versioning mechanism.
- Whether JSON Schema import is native or adapter-based.
- Exact expression language for advanced conditional logic.
- Exact builder persistence format beyond `FormSchema`.
- Exact theme token naming convention.
- Official validation adapter package names.
- Server-side rendering guarantees.
- React Native, Vue, Angular, Svelte, and Flutter renderer contracts.
