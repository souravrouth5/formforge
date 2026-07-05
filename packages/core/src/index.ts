export type PrimitiveValue = string | number | boolean | null;

export interface FileValue {
  id?: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  file?: File;
  metadata?: Record<string, unknown>;
}

export type FieldValue =
  | PrimitiveValue
  | PrimitiveValue[]
  | FileValue
  | FileValue[]
  | Record<string, unknown>
  | Record<string, unknown>[];

export type FormValues = Record<string, FieldValue>;

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "password"
  | "phone"
  | "range"
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

export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

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

export interface FieldLayoutSchema {
  span?: number;
  rowSpan?: number;
  order?: number;
  width?: number | string;
  minWidth?: number | string;
  maxWidth?: number | string;
  responsive?: ResponsiveFieldLayoutSchema;
}

export type ResponsiveLayoutSchema = Partial<Record<Breakpoint, LayoutSchema>>;

export type ResponsiveFieldLayoutSchema = Partial<
  Record<Breakpoint, FieldLayoutSchema>
>;

export interface FieldStyleSchema {
  className?: string;
  style?: Record<string, string | number>;
}

export interface FieldOption<TValue = string> {
  label: string;
  value: TValue;
  description?: string;
  disabled?: boolean;
  metadata?: Record<string, unknown>;
}

export interface FieldSchema<
  TType extends string = FieldType,
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

export interface SectionSchema {
  id: string;
  title?: string;
  description?: string;
  fields: string[];
  layout?: LayoutSchema;
  hidden?: boolean | ConditionExpression;
  metadata?: Record<string, unknown>;
}

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

export interface FormValidationSchema<TValues extends FormValues = FormValues> {
  rules?: ValidationRule[];
  adapter?: ValidationAdapter<unknown, TValues>;
}

export type CustomValidationFunction<TValue = FieldValue> = (
  value: TValue,
  context: ValidationContext,
) => Promise<FieldValidationResult> | FieldValidationResult;

export interface ValidationRule<TValue = FieldValue> {
  type: string;
  message?: string;
  value?: unknown;
  when?: ConditionExpression;
  metadata?: Record<string, unknown>;
  validate?: CustomValidationFunction<TValue>;
}

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

export interface ValidationContext<TValues extends FormValues = FormValues> {
  schema: FormSchema<TValues>;
  values: TValues;
  field?: FieldSchema;
  state: FormState<TValues>;
  signal?: AbortSignal;
}

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

export type FieldEventHandlers = Partial<
  Record<FormEventName, string | FormEventHandler<FormEventName>>
>;

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

export interface FieldState<TValue = FieldValue> {
  name: string;
  value: TValue | undefined;
  initialValue: TValue | undefined;
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

export interface FormEngineSnapshot<TValues extends FormValues = FormValues> {
  schema: FormSchema<TValues>;
  state: FormState<TValues>;
}

export interface FormEngineOptions<TValues extends FormValues = FormValues> {
  schema: FormSchema<TValues>;
  defaultValues?: Partial<TValues>;
  validationAdapter?: ValidationAdapter<unknown, TValues>;
  plugins?: FormPlugin<Record<string, unknown>, TValues>[];
  registry?: FieldRegistry;
}

export type Unsubscribe = () => void;

export type FormStateListener<TValues extends FormValues = FormValues> = (
  state: FormState<TValues>,
) => void;

export type FieldStateListener = (state: FieldState) => void;

export interface FormEngine<TValues extends FormValues = FormValues> {
  getState(): FormState<TValues>;
  getSnapshot(): FormEngineSnapshot<TValues>;
  getValue<TValue extends FieldValue = FieldValue>(name: string): TValue | undefined;
  setValue<TValue extends FieldValue = FieldValue>(name: string, value: TValue): void;
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

export interface FieldRegistry {
  register(definition: FieldDefinition): void;
  unregister(type: string): void;
  has(type: string): boolean;
  get(type: string): FieldDefinition | undefined;
  list(): FieldDefinition[];
}

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

export interface FieldDefinitionSchema {
  label?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

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

export type FormEventHandler<
  TName extends FormEventName,
  TValues extends FormValues = FormValues,
> = (payload: FormEventMap<TValues>[TName]) => void | Promise<void>;

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
  ): Promise<void>;
}

export interface FormPlugin<
  TOptions extends Record<string, unknown> = Record<string, unknown>,
  TValues extends FormValues = FormValues,
> {
  name: string;
  version?: string;
  options?: TOptions;
  setup(context: PluginContext<TValues>): void | PluginCleanup;
}

export interface PluginContext<TValues extends FormValues = FormValues> {
  schema: FormSchema<TValues>;
  engine: FormEngine<TValues>;
  events: EventBus<TValues>;
  registry: FieldRegistry;
  metadata?: Record<string, unknown>;
}

export type PluginCleanup = () => void | Promise<void>;

export interface PluginManager<TValues extends FormValues = FormValues> {
  setupAll(context: PluginContext<TValues>): void;
  cleanupAll(): Promise<void>;
}

export interface PluginSchema {
  name: string;
  enabled?: boolean;
  options?: Record<string, unknown>;
}

export interface SubmitSchema<TValues extends FormValues = FormValues> {
  mode?: "manual" | "native" | "async";
  validateBeforeSubmit?: boolean;
  resetOnSuccess?: boolean;
  handler?: SubmitHandler<TValues>;
  metadata?: Record<string, unknown>;
}

export type SubmitHandler<TValues extends FormValues = FormValues> = (
  values: TValues,
  context: SubmitContext<TValues>,
) => Promise<SubmitResult> | SubmitResult;

export interface SubmitContext<TValues extends FormValues = FormValues> {
  schema: FormSchema<TValues>;
  state: FormState<TValues>;
  engine: FormEngine<TValues>;
  signal?: AbortSignal;
}

export interface SubmitResult<TData = unknown> {
  ok: boolean;
  data?: TData;
  errors?: FormErrors;
  message?: string;
  metadata?: Record<string, unknown>;
}

export type FormErrorType =
  | "schema"
  | "validation"
  | "runtime"
  | "plugin"
  | "rendering"
  | "submission";

export interface FormError {
  type: FormErrorType;
  message: string;
  code?: string;
  field?: string;
  cause?: unknown;
  metadata?: Record<string, unknown>;
}

export class FormBuilderError extends Error {
  readonly type: FormErrorType;
  readonly code?: string;
  readonly field?: string;
  readonly cause?: unknown;
  readonly metadata?: Record<string, unknown>;

  constructor(error: FormError) {
    super(error.message);
    this.name = "FormBuilderError";
    this.type = error.type;

    if (error.code !== undefined) {
      this.code = error.code;
    }

    if (error.field !== undefined) {
      this.field = error.field;
    }

    if (error.cause !== undefined) {
      this.cause = error.cause;
    }

    if (error.metadata !== undefined) {
      this.metadata = error.metadata;
    }
  }
}

export function createSchemaError(
  message: string,
  metadata?: Record<string, unknown>,
): FormBuilderError {
  if (metadata === undefined) {
    return new FormBuilderError({ type: "schema", message });
  }

  return new FormBuilderError({ type: "schema", message, metadata });
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isFieldSchema(value: unknown): value is FieldSchema {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.type === "string"
  );
}

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

export function normalizeSchema<TValues extends FormValues>(
  schema: FormSchema<TValues>,
): FormSchema<TValues> {
  const seen = new Set<string>();

  for (const field of schema.fields) {
    if (seen.has(field.id)) {
      throw createSchemaError(`Duplicate field id "${field.id}".`, {
        fieldId: field.id,
      });
    }

    seen.add(field.id);
  }

  return schema;
}

export function parseSchema<TValues extends FormValues = FormValues>(
  input: unknown,
): FormSchema<TValues> {
  if (!isFormSchema(input)) {
    throw createSchemaError("Invalid form schema.");
  }

  return normalizeSchema(input as FormSchema<TValues>);
}

export function createFieldRegistry(
  initialDefinitions: FieldDefinition[] = [],
): FieldRegistry {
  const definitions = new Map<string, FieldDefinition>();

  const registry: FieldRegistry = {
    register(definition) {
      definitions.set(definition.type, definition);
    },
    unregister(type) {
      definitions.delete(type);
    },
    has(type) {
      return definitions.has(type);
    },
    get(type) {
      return definitions.get(type);
    },
    list() {
      return Array.from(definitions.values());
    },
  };

  for (const definition of initialDefinitions) {
    registry.register(definition);
  }

  return registry;
}

type EventHandlerSet<TValues extends FormValues> = Set<
  FormEventHandler<FormEventName, TValues>
>;

export function createEventBus<
  TValues extends FormValues = FormValues,
>(): EventBus<TValues> {
  const handlers = new Map<FormEventName, EventHandlerSet<TValues>>();

  function add<TName extends FormEventName>(
    name: TName,
    handler: FormEventHandler<TName, TValues>,
  ): Unsubscribe {
    const current = handlers.get(name) ?? new Set();
    current.add(handler as FormEventHandler<FormEventName, TValues>);
    handlers.set(name, current);

    return () => {
      current.delete(handler as FormEventHandler<FormEventName, TValues>);
    };
  }

  return {
    on: add,
    once(name, handler) {
      const unsubscribe = add(name, async (payload) => {
        unsubscribe();
        await handler(payload);
      });

      return unsubscribe;
    },
    async emit(name, payload) {
      const current = handlers.get(name);

      if (!current) {
        return;
      }

      for (const handler of Array.from(current)) {
        await handler(payload);
      }
    },
  };
}

export function createPluginManager<
  TValues extends FormValues = FormValues,
>(plugins: FormPlugin<Record<string, unknown>, TValues>[] = []): PluginManager<TValues> {
  const cleanups: PluginCleanup[] = [];

  return {
    setupAll(context) {
      for (const plugin of plugins) {
        const cleanup = plugin.setup(context);

        if (typeof cleanup === "function") {
          cleanups.push(cleanup);
        }
      }
    },
    async cleanupAll() {
      while (cleanups.length > 0) {
        const cleanup = cleanups.pop();

        if (cleanup) {
          await cleanup();
        }
      }
    },
  };
}

export interface ValidationManager<TValues extends FormValues = FormValues> {
  validate(state: FormState<TValues>): Promise<ValidationResult>;
  validateField(
    name: string,
    state: FormState<TValues>,
  ): Promise<FieldValidationResult>;
}

export function createValidationManager<
  TValues extends FormValues = FormValues,
>(
  schema: FormSchema<TValues>,
  adapter?: ValidationAdapter<unknown, TValues>,
): ValidationManager<TValues> {
  return {
    async validate(state) {
      if (!adapter) {
        return { valid: true, errors: {} };
      }

      return adapter.validateForm(state.values, { schema, values: state.values, state });
    },
    async validateField(name, state) {
      const value = state.values[name];
      const field = schema.fields.find((item) => item.name === name);

      if (!adapter?.validateField) {
        return { valid: true };
      }

      const context: ValidationContext<TValues> = {
        schema,
        values: state.values,
        state,
      };

      if (field !== undefined) {
        context.field = field;
      }

      return adapter.validateField(name, value ?? null, context);
    },
  };
}

function createInitialState<TValues extends FormValues>(
  schema: FormSchema<TValues>,
  defaultValues: Partial<TValues> = {},
): FormState<TValues> {
  const values: FormValues = {};

  for (const field of schema.fields) {
    const defaultValue = field.defaultValue;

    if (defaultValue !== undefined) {
      values[field.name] = defaultValue as FieldValue;
    }
  }

  const merged = { ...values, ...defaultValues } as TValues;

  return {
    values: merged,
    initialValues: merged,
    errors: {},
    touched: {},
    dirty: {},
    visited: {},
    focused: null,
    hidden: {},
    disabled: {},
    readonly: {},
    validating: false,
    submitting: false,
    submitted: false,
    submitCount: 0,
    valid: true,
    loading: false,
  };
}

function getFieldState<TValues extends FormValues>(
  state: FormState<TValues>,
  name: string,
): FieldState {
  const value = state.values[name];
  const initialValue = state.initialValues[name];

  return {
    name,
    value,
    initialValue,
    errors: state.errors[name] ?? [],
    touched: state.touched[name] ?? false,
    dirty: state.dirty[name] ?? false,
    visited: state.visited[name] ?? false,
    focused: state.focused === name,
    hidden: state.hidden[name] ?? false,
    disabled: state.disabled[name] ?? false,
    readonly: state.readonly[name] ?? false,
    validating: state.validating,
  };
}

export function createFormEngine<
  TValues extends FormValues = FormValues,
>(options: FormEngineOptions<TValues>): FormEngine<TValues> {
  const schema = normalizeSchema(options.schema);
  const registry = options.registry ?? createFieldRegistry();
  const events = createEventBus<TValues>();
  const validation = createValidationManager(
    schema,
    options.validationAdapter ?? schema.validation?.adapter,
  );
  const plugins = createPluginManager(options.plugins);
  const formListeners = new Set<FormStateListener<TValues>>();
  const fieldListeners = new Map<string, Set<FieldStateListener>>();
  let state = createInitialState(schema, options.defaultValues);
  let destroyed = false;

  function ensureActive(): void {
    if (destroyed) {
      throw new FormBuilderError({
        type: "runtime",
        message: "Cannot use a destroyed form engine.",
      });
    }
  }

  function publish(changedField?: string): void {
    for (const listener of Array.from(formListeners)) {
      listener(state);
    }

    if (changedField) {
      const listeners = fieldListeners.get(changedField);

      if (listeners) {
        const fieldState = getFieldState(state, changedField);

        for (const listener of Array.from(listeners)) {
          listener(fieldState);
        }
      }
    }
  }

  const engine: FormEngine<TValues> = {
    getState() {
      ensureActive();
      return state;
    },
    getSnapshot() {
      ensureActive();
      return { schema, state };
    },
    getValue<TValue extends FieldValue = FieldValue>(name: string) {
      ensureActive();
      return state.values[name] as TValue | undefined;
    },
    setValue(name, value) {
      ensureActive();
      const previousValue = state.values[name] ?? null;
      state = {
        ...state,
        values: { ...state.values, [name]: value } as TValues,
        dirty: { ...state.dirty, [name]: true },
      };
      publish(name);
      void events.emit("change", {
        name,
        value: value as FieldValue,
        previousValue,
      });
    },
    setValues(values) {
      ensureActive();
      state = {
        ...state,
        values: { ...state.values, ...values } as TValues,
      };
      publish();
    },
    reset(values) {
      ensureActive();
      state = createInitialState(schema, values);
      publish();
    },
    touch(name) {
      ensureActive();
      state = {
        ...state,
        touched: { ...state.touched, [name]: true },
        visited: { ...state.visited, [name]: true },
      };
      publish(name);
    },
    focus(name) {
      ensureActive();
      state = { ...state, focused: name, visited: { ...state.visited, [name]: true } };
      publish(name);
      void events.emit("focus", { name });
    },
    blur(name) {
      ensureActive();
      state = {
        ...state,
        focused: state.focused === name ? null : state.focused,
        touched: { ...state.touched, [name]: true },
      };
      publish(name);
      void events.emit("blur", { name });
    },
    async validate() {
      ensureActive();
      state = { ...state, validating: true };
      publish();
      const result = await validation.validate(state);
      state = {
        ...state,
        validating: false,
        valid: result.valid,
        errors: result.errors,
      };
      publish();
      await events.emit("validate", { result });
      return result;
    },
    async validateField(name) {
      ensureActive();
      state = { ...state, validating: true };
      publish(name);
      const result = await validation.validateField(name, state);
      const nextErrors = { ...state.errors };

      if (result.error) {
        nextErrors[name] = [result.error];
      } else {
        delete nextErrors[name];
      }

      state = {
        ...state,
        validating: false,
        valid: Object.keys(nextErrors).length === 0,
        errors: nextErrors,
      };
      publish(name);
      return result;
    },
    async submit() {
      ensureActive();
      state = {
        ...state,
        submitting: true,
        submitCount: state.submitCount + 1,
      };
      publish();

      await events.emit("submit", { values: state.values });

      const shouldValidate = schema.submit?.validateBeforeSubmit ?? true;

      if (shouldValidate) {
        const result = await engine.validate();

        if (!result.valid) {
          const failed: SubmitResult = {
            ok: false,
            errors: result.errors,
            message: "Validation failed.",
          };
          state = { ...state, submitting: false, submitted: true };
          publish();
          return failed;
        }
      }

      const submitResult =
        (await schema.submit?.handler?.(state.values, {
          schema,
          state,
          engine,
        })) ?? { ok: true };

      state = { ...state, submitting: false, submitted: true };
      publish();

      if (submitResult.ok) {
        await events.emit("success", { result: submitResult });
      }

      return submitResult;
    },
    subscribe(listener) {
      ensureActive();
      formListeners.add(listener);
      return () => {
        formListeners.delete(listener);
      };
    },
    subscribeField(name, listener) {
      ensureActive();
      const listeners = fieldListeners.get(name) ?? new Set<FieldStateListener>();
      listeners.add(listener);
      fieldListeners.set(name, listeners);

      return () => {
        listeners.delete(listener);
      };
    },
    destroy() {
      if (destroyed) {
        return;
      }

      destroyed = true;
      formListeners.clear();
      fieldListeners.clear();
      void plugins.cleanupAll();
      void events.emit("destroy", { engine });
    },
  };

  for (const field of schema.fields) {
    if (!registry.has(field.type)) {
      registry.register({ type: field.type });
    }
  }

  plugins.setupAll({ schema, engine, events, registry });
  void events.emit("init", { engine });
  void events.emit("load", { schema });

  return engine;
}
