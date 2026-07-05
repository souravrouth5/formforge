import type {
  ChangeEvent,
  ComponentType,
  CSSProperties,
  FormEvent,
  InputHTMLAttributes,
  ReactElement,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import type {
  FieldError,
  FieldOption,
  FieldSchema,
  FieldState,
  FieldValue,
  FileValue,
  FormEngine,
  FormEngineOptions,
  FormErrors,
  FormPlugin,
  FormSchema,
  FormState,
  FormValues,
  PrimitiveValue,
  SubmitHandler,
  SubmitResult,
  ValidationAdapter,
  ValidationResult,
} from "@easy-form-builder/core";
import { createFormEngine } from "@easy-form-builder/core";

type FieldName<TValues extends FormValues> = Extract<keyof TValues, string>;

export type FieldPath<TValues extends FormValues = FormValues> =
  | FieldName<TValues>
  | string;

export interface RegisterOptions<TValue = FieldValue> {
  valueAsNumber?: boolean;
  valueAsBoolean?: boolean;
  setValueAs?(value: unknown): TValue;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface RegisteredFieldProps<
  TValues extends FormValues = FormValues,
  TValue extends FieldValue = FieldValue,
> {
  name: FieldPath<TValues>;
  value?: TValue | undefined;
  checked?: boolean | undefined;
  onChange(eventOrValue: ChangeEvent<FormControlElement> | TValue): void;
  onBlur(): void;
  onFocus(): void;
  ref(element: FormControlElement | null): void;
}

export type FormControlElement =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

export interface ReactFieldComponentProps<
  TValue = FieldValue,
  TField extends FieldSchema = FieldSchema,
> {
  field: TField;
  value: TValue | undefined;
  state: FieldState<TValue>;
  register: RegisteredFieldProps<FormValues, FieldValue>;
  onChange(value: TValue): void;
  onBlur(): void;
  onFocus(): void;
  errorId?: string | undefined;
  describedBy?: string | undefined;
}

export type ReactFieldComponent<
  TValue = FieldValue,
  TField extends FieldSchema = FieldSchema,
> = ComponentType<ReactFieldComponentProps<TValue, TField>>;

export type ComponentOverrideMap = Partial<
  Record<string, ReactFieldComponent<FieldValue, FieldSchema>>
>;

export interface FieldWrapperProps {
  field: FieldSchema;
  state: FieldState;
  children: ReactNode;
}

export interface LabelProps {
  field: FieldSchema;
  htmlFor?: string;
}

export interface DescriptionProps {
  field: FieldSchema;
  id?: string;
}

export interface ErrorProps {
  field: FieldSchema;
  errors: FieldError[];
}

export interface HelpTextProps {
  field: FieldSchema;
  children?: ReactNode;
}

export interface SubmitButtonProps {
  submitting: boolean;
  disabled: boolean;
  children?: ReactNode;
}

export interface LayoutRendererProps<TValues extends FormValues = FormValues> {
  schema: FormSchema<TValues>;
  children?: ReactNode;
}

export interface SlotOverrideMap {
  FieldWrapper?: ComponentType<FieldWrapperProps>;
  Label?: ComponentType<LabelProps>;
  Description?: ComponentType<DescriptionProps>;
  Error?: ComponentType<ErrorProps>;
  HelpText?: ComponentType<HelpTextProps>;
  SubmitButton?: ComponentType<SubmitButtonProps>;
  Layout?: ComponentType<LayoutRendererProps>;
}

export interface FormTheme {
  name: string;
  tokens?: Record<string, string | number>;
  components?: ComponentOverrideMap;
  slots?: SlotOverrideMap;
  classNames?: Record<string, string>;
  metadata?: Record<string, unknown>;
}

export interface FormProps<TValues extends FormValues = FormValues> {
  schema?: FormSchema<TValues> | undefined;
  form?: UseFormReturn<TValues> | undefined;
  children?: ReactNode | ((form: UseFormReturn<TValues>) => ReactNode);
  defaultValues?: Partial<TValues> | undefined;
  values?: Partial<TValues> | undefined;
  onValuesChange?(values: TValues, state: FormState<TValues>): void;
  onSubmit?: SubmitHandler<TValues> | undefined;
  onError?(error: unknown): void;
  validationAdapter?: ValidationAdapter<unknown, TValues> | undefined;
  plugins?: FormPlugin<Record<string, unknown>, TValues>[] | undefined;
  components?: ComponentOverrideMap | undefined;
  slots?: SlotOverrideMap | undefined;
  theme?: FormTheme | string | undefined;
  disabled?: boolean;
  readonly?: boolean;
  className?: string;
  style?: CSSProperties;
  renderSubmitButton?: boolean;
  submitLabel?: ReactNode;
}

export interface FormProviderProps<TValues extends FormValues = FormValues> {
  form: UseFormReturn<TValues> | FormEngine<TValues>;
  children?: ReactNode;
}

export interface FieldRendererProps<TValues extends FormValues = FormValues> {
  field: FieldSchema;
  components?: ComponentOverrideMap | undefined;
  slots?: SlotOverrideMap | undefined;
  form?: UseFormReturn<TValues> | undefined;
}

export interface UseFormOptions<TValues extends FormValues = FormValues> {
  schema?: FormSchema<TValues> | undefined;
  defaultValues?: Partial<TValues> | undefined;
  validationAdapter?: ValidationAdapter<unknown, TValues> | undefined;
  plugins?: FormPlugin<Record<string, unknown>, TValues>[] | undefined;
  onSubmit?: SubmitHandler<TValues> | undefined;
}

export interface UseFormReturn<TValues extends FormValues = FormValues> {
  engine: FormEngine<TValues>;
  control: FormEngine<TValues>;
  state: FormState<TValues>;
  formState: FormState<TValues>;
  values: TValues;
  errors: FormErrors;
  register<TValue extends FieldValue = FieldValue>(
    name: FieldPath<TValues>,
    options?: RegisterOptions<TValue>,
  ): RegisteredFieldProps<TValues, TValue>;
  handleSubmit(
    onValid?: SubmitHandler<TValues>,
    onInvalid?: (errors: FormErrors, state: FormState<TValues>) => void,
  ): (event?: FormEvent<HTMLFormElement>) => Promise<SubmitResult>;
  setValue<TValue extends FieldValue = FieldValue>(
    name: FieldPath<TValues>,
    value: TValue,
  ): void;
  getValue<TValue extends FieldValue = FieldValue>(
    name: FieldPath<TValues>,
  ): TValue | undefined;
  watch(): TValues;
  watch<TValue extends FieldValue = FieldValue>(
    name: FieldPath<TValues>,
  ): TValue | undefined;
  validate(): Promise<ValidationResult>;
  validateField(name: FieldPath<TValues>): Promise<FieldValidationResult>;
  submit(): Promise<SubmitResult>;
  reset(values?: Partial<TValues>): void;
}

export interface FieldValidationResult {
  valid: boolean;
  error?: FieldError;
}

export interface UseFieldOptions<TValue extends FieldValue = FieldValue> {
  name: string;
  defaultValue?: TValue | undefined;
  validateOnChange?: boolean | undefined;
  validateOnBlur?: boolean | undefined;
}

export interface UseFieldReturn<TValue extends FieldValue = FieldValue> {
  name: string;
  value: TValue | undefined;
  state: FieldState<TValue>;
  errors: FieldError[];
  field: RegisteredFieldProps<FormValues, TValue>;
  setValue(value: TValue): void;
  onChange(value: TValue): void;
  onBlur(): void;
  onFocus(): void;
}

export interface UseWatchOptions {
  name?: string | string[];
}

export type UseWatchReturn<TValues extends FormValues = FormValues> =
  | FieldValue
  | Partial<TValues>
  | undefined;

const FormContext = createContext<UseFormReturn<FormValues> | null>(null);

export function useForm<TValues extends FormValues = FormValues>(
  options: UseFormOptions<TValues> = {},
): UseFormReturn<TValues> {
  const schema = options.schema ?? ({ id: "form", fields: [] } as FormSchema<TValues>);
  const submitRef = useRef<SubmitHandler<TValues> | undefined>(options.onSubmit);

  submitRef.current = options.onSubmit;

  const engine = useMemo(() => {
    const schemaWithSubmit = submitRef.current
      ? {
          ...schema,
          submit: {
            ...schema.submit,
            handler: submitRef.current,
          },
        }
      : schema;
    const engineOptions: FormEngineOptions<TValues> = { schema: schemaWithSubmit };

    if (options.defaultValues !== undefined) {
      engineOptions.defaultValues = options.defaultValues;
    }

    if (options.validationAdapter !== undefined) {
      engineOptions.validationAdapter = options.validationAdapter;
    }

    if (options.plugins !== undefined) {
      engineOptions.plugins = options.plugins;
    }

    return createFormEngine(engineOptions);
  }, [schema, options.defaultValues, options.plugins, options.validationAdapter]);

  const state = useSyncExternalStore(
    engine.subscribe,
    engine.getState,
    engine.getState,
  );

  useEffect(() => {
    return () => {
      engine.destroy();
    };
  }, [engine]);

  const register = useCallback(
    <TValue extends FieldValue = FieldValue>(
      name: FieldPath<TValues>,
      registerOptions: RegisterOptions<TValue> = {},
    ): RegisteredFieldProps<TValues, TValue> => {
      const fieldName = String(name);
      const currentValue = engine.getValue<TValue>(fieldName);

      const registered: RegisteredFieldProps<TValues, TValue> = {
        name,
        onChange(eventOrValue) {
          const value = normalizeInputValue<TValue>(eventOrValue, registerOptions);
          engine.setValue(fieldName, value);

          if (registerOptions.validateOnChange === true) {
            void engine.validateField(fieldName);
          }
        },
        onBlur() {
          engine.blur(fieldName);

          if (registerOptions.validateOnBlur === true) {
            void engine.validateField(fieldName);
          }
        },
        onFocus() {
          engine.focus(fieldName);
        },
        ref() {
          return undefined;
        },
      };

      if (currentValue !== undefined) {
        registered.value = currentValue;
      }

      if (typeof currentValue === "boolean") {
        registered.checked = currentValue;
      }

      return registered;
    },
    [engine],
  );

  const handleSubmit = useCallback(
    (
      onValid?: SubmitHandler<TValues>,
      onInvalid?: (errors: FormErrors, state: FormState<TValues>) => void,
    ) => {
      return async (event?: FormEvent<HTMLFormElement>) => {
        event?.preventDefault();
        const result = await engine.submit();

        if (!result.ok) {
          onInvalid?.(result.errors ?? {}, engine.getState());
          return result;
        }

        if (onValid !== undefined) {
          return onValid(engine.getState().values, {
            schema,
            state: engine.getState(),
            engine,
          });
        }

        return result;
      };
    },
    [engine, schema],
  );

  const watch = useCallback(
    ((name?: FieldPath<TValues>) => {
      if (name === undefined) {
        return engine.getState().values;
      }

      return engine.getValue(String(name));
    }) as UseFormReturn<TValues>["watch"],
    [engine],
  );

  const form = useMemo<UseFormReturn<TValues>>(
    () => ({
      engine,
      control: engine,
      state,
      formState: state,
      values: state.values,
      errors: state.errors,
      register,
      handleSubmit,
      setValue(name, value) {
        engine.setValue(String(name), value);
      },
      getValue(name) {
        return engine.getValue(String(name));
      },
      watch,
      validate: engine.validate,
      validateField(name) {
        return engine.validateField(String(name));
      },
      submit: engine.submit,
      reset: engine.reset,
    }),
    [engine, handleSubmit, register, state, watch],
  );

  return form;
}

export function useField<TValue extends FieldValue = FieldValue>(
  options: UseFieldOptions<TValue>,
): UseFieldReturn<TValue> {
  const form = useFormContext();
  const fieldState = useSyncExternalStore(
    (listener) => form.engine.subscribeField(options.name, listener),
    () => form.engine.getSnapshot().state,
    () => form.engine.getSnapshot().state,
  );
  const state = getFieldStateFromForm<TValue>(fieldState, options.name);

  useEffect(() => {
    if (
      options.defaultValue !== undefined &&
      form.getValue(options.name) === undefined
    ) {
      form.setValue(options.name, options.defaultValue as FieldValue);
    }
  }, [form, options.defaultValue, options.name]);

  const registerOptions: RegisterOptions<TValue & FieldValue> = {};

  if (options.validateOnBlur !== undefined) {
    registerOptions.validateOnBlur = options.validateOnBlur;
  }

  if (options.validateOnChange !== undefined) {
    registerOptions.validateOnChange = options.validateOnChange;
  }

  const registered = form.register<TValue & FieldValue>(
    options.name,
    registerOptions,
  );

  return {
    name: options.name,
    value: state.value,
    state,
    errors: state.errors,
    field: registered as RegisteredFieldProps<FormValues, TValue>,
    setValue(value) {
      form.setValue(options.name, value as FieldValue);
    },
    onChange(value) {
      form.setValue(options.name, value as FieldValue);
    },
    onBlur() {
      form.engine.blur(options.name);
    },
    onFocus() {
      form.engine.focus(options.name);
    },
  };
}

export function useWatch<TValues extends FormValues = FormValues>(
  options: UseWatchOptions = {},
): UseWatchReturn<TValues> {
  const form = useFormContext<TValues>();
  const state = useSyncExternalStore(
    form.engine.subscribe,
    form.engine.getState,
    form.engine.getState,
  );

  if (typeof options.name === "string") {
    return state.values[options.name];
  }

  if (Array.isArray(options.name)) {
    return options.name.reduce<Partial<TValues>>((values, name) => {
      return {
        ...values,
        [name]: state.values[name],
      };
    }, {});
  }

  return state.values;
}

export function useFormContext<
  TValues extends FormValues = FormValues,
>(): UseFormReturn<TValues> {
  const form = useContext(FormContext);

  if (!form) {
    throw new Error("useFormContext must be used inside FormProvider.");
  }

  return form as UseFormReturn<TValues>;
}

export function useFormState<TValues extends FormValues = FormValues>(): FormState<TValues> {
  return useFormContext<TValues>().state;
}

export function Form<TValues extends FormValues = FormValues>(
  props: FormProps<TValues>,
): ReactElement {
  const useFormOptions: UseFormOptions<TValues> = {};

  if (props.schema !== undefined) {
    useFormOptions.schema = props.schema;
  }

  if (props.defaultValues !== undefined) {
    useFormOptions.defaultValues = props.defaultValues;
  }

  if (props.validationAdapter !== undefined) {
    useFormOptions.validationAdapter = props.validationAdapter;
  }

  if (props.plugins !== undefined) {
    useFormOptions.plugins = props.plugins;
  }

  if (props.onSubmit !== undefined) {
    useFormOptions.onSubmit = props.onSubmit;
  }

  const ownedForm = useForm<TValues>(useFormOptions);
  const form = props.form ?? ownedForm;

  useEffect(() => {
    if (props.values !== undefined) {
      form.engine.setValues(props.values);
    }
  }, [form.engine, props.values]);

  useEffect(() => {
    if (props.onValuesChange === undefined) {
      return undefined;
    }

    return form.engine.subscribe((state) => {
      props.onValuesChange?.(state.values, state);
    });
  }, [form.engine, props.onValuesChange]);

  const schema = props.schema ?? form.engine.getSnapshot().schema;
  const content =
    typeof props.children === "function"
      ? props.children(form)
      : props.children ?? createDefaultFields(schema, props, form);

  const submitButton =
    props.renderSubmitButton === false
      ? null
      : createElement(
          props.slots?.SubmitButton ?? DefaultSubmitButton,
          {
            submitting: form.state.submitting,
            disabled: props.disabled === true || form.state.submitting,
          },
          props.submitLabel ?? "Submit",
        );

  return createElement(
    FormProvider,
    { form, children: null },
    createElement(
      "form",
      {
        className: props.className,
        style: props.style,
        noValidate: true,
        onSubmit: form.handleSubmit(props.onSubmit, (errors) => {
          props.onError?.(errors);
        }),
      },
      content,
      submitButton,
    ),
  );
}

export function FormProvider<TValues extends FormValues = FormValues>(
  props: FormProviderProps<TValues>,
): ReactElement {
  const form = isFormReturn(props.form)
    ? props.form
    : createFormReturnFromEngine(props.form);

  return createElement(
    FormContext.Provider,
    { value: form as UseFormReturn<FormValues> },
    props.children,
  );
}

export function FieldRenderer<TValues extends FormValues = FormValues>(
  props: FieldRendererProps<TValues>,
): ReactElement | null {
  const form = props.form ?? useFormContext<TValues>();
  const state = getFieldStateFromForm(form.state, props.field.name);

  if (state.hidden) {
    return null;
  }

  const Component = props.components?.[props.field.type] ?? DefaultFieldComponent;
  const fieldId = props.field.id;
  const errorId = `${fieldId}-error`;
  const descriptionId = `${fieldId}-description`;
  const errors = state.errors;
  const describedBy = [
    props.field.description ? descriptionId : undefined,
    errors.length > 0 ? errorId : undefined,
  ]
    .filter((value): value is string => typeof value === "string")
    .join(" ");
  const registered = form.register(props.field.name, {
    valueAsNumber: props.field.type === "number" || props.field.type === "range",
    validateOnBlur: true,
  });
  const wrapperProps: FieldWrapperProps = {
    field: props.field,
    state,
    children: createElement(
      Component,
      compactProps({
        field: props.field,
        value: state.value,
        state,
        register: registered as RegisteredFieldProps<FormValues, FieldValue>,
        onChange(value: FieldValue) {
          form.setValue(props.field.name, value);
        },
        onBlur() {
          form.engine.blur(props.field.name);
        },
        onFocus() {
          form.engine.focus(props.field.name);
        },
        errorId,
        describedBy: describedBy.length > 0 ? describedBy : undefined,
      }),
    ),
  };

  return createElement(props.slots?.FieldWrapper ?? DefaultFieldWrapper, wrapperProps);
}

export function LayoutRenderer<TValues extends FormValues = FormValues>(
  props: LayoutRendererProps<TValues>,
): ReactElement {
  const Layout = DefaultLayout as ComponentType<LayoutRendererProps<TValues>>;

  return createElement(Layout, props, props.children);
}

function createDefaultFields<TValues extends FormValues>(
  schema: FormSchema<TValues>,
  props: Pick<FormProps<TValues>, "components" | "slots">,
  form: UseFormReturn<TValues>,
): ReactNode {
  return createElement(
    LayoutRenderer<TValues>,
    { schema },
    schema.fields.map((field) =>
      createElement(FieldRenderer<TValues>, compactProps({
        key: field.id,
        field,
        components: props.components,
        slots: props.slots,
        form,
      })),
    ),
  );
}

function DefaultLayout(props: LayoutRendererProps): ReactElement {
  return createElement(
    "div",
    {
      "data-form-layout": props.schema.layout?.type ?? "stack",
    },
    props.children,
  );
}

function DefaultFieldWrapper(props: FieldWrapperProps): ReactElement {
  const description =
    props.field.description === undefined
      ? null
      : createElement(
          "p",
          { id: `${props.field.id}-description` },
          props.field.description,
        );
  const error =
    props.state.errors.length === 0
      ? null
      : createElement(
          "p",
          { id: `${props.field.id}-error`, role: "alert" },
          props.state.errors[0]?.message,
        );

  return createElement(
    "div",
    {
      "data-field": props.field.name,
      "data-field-type": props.field.type,
      hidden: props.state.hidden,
    },
    props.field.label
      ? createElement("label", { htmlFor: props.field.id }, props.field.label)
      : null,
    description,
    props.children,
    error,
  );
}

function DefaultSubmitButton(props: SubmitButtonProps): ReactElement {
  return createElement(
    "button",
    {
      type: "submit",
      disabled: props.disabled,
    },
    props.children ?? (props.submitting ? "Submitting..." : "Submit"),
  );
}

function DefaultFieldComponent(
  props: ReactFieldComponentProps<FieldValue, FieldSchema>,
): ReactElement {
  switch (props.field.type) {
    case "textarea":
      return createElement("textarea", {
        ...baseTextareaProps(props),
        value: stringValue(props.value),
      });
    case "select":
    case "multiselect":
      return createElement(
        "select",
        {
          ...baseSelectProps(props),
          multiple: props.field.type === "multiselect",
          value: selectValue(props.value, props.field.type === "multiselect"),
        },
        (props.field.options ?? []).map((option) =>
          createElement(
            "option",
            {
              key: String(option.value),
              value: String(option.value),
              disabled: option.disabled,
            },
            option.label,
          ),
        ),
      );
    case "radio":
      return createElement(
        "div",
        { role: "radiogroup", "aria-describedby": props.describedBy },
        (props.field.options ?? []).map((option) =>
          createRadioOption(props, option),
        ),
      );
    case "checkbox":
    case "switch":
      return createElement("input", {
        ...baseInputProps(props, "checkbox"),
        checked: booleanValue(props.value),
        value: undefined,
      });
    case "file":
    case "image":
      return createElement("input", {
        id: props.field.id,
        name: props.field.name,
        type: "file",
        required: props.field.required,
        disabled: props.state.disabled || props.field.disabled === true,
        readOnly: props.state.readonly || props.field.readonly === true,
        "aria-invalid": props.state.errors.length > 0,
        "aria-describedby": props.describedBy,
        multiple: props.field.type === "image" || Boolean(props.field.metadata?.multiple),
        accept: fileAccept(props.field),
        onChange(event: ChangeEvent<HTMLInputElement>) {
          props.onChange(fileValue(event.currentTarget.files));
        },
        onBlur: props.onBlur,
        onFocus: props.onFocus,
      });
    case "number":
    case "range":
      return createElement("input", {
        ...baseInputProps(props, props.field.type),
        value: numberInputValue(props.value),
        min: numericMetadata(props.field, "min"),
        max: numericMetadata(props.field, "max"),
        step: numericMetadata(props.field, "step"),
      });
    case "email":
    case "phone":
    case "date":
    case "time":
    case "password":
    case "url":
    case "color":
    case "hidden":
    case "text":
    default:
      return createElement("input", {
        ...baseInputProps(props, inputType(props.field.type)),
        value: stringValue(props.value),
      });
  }
}

function baseInputProps(
  props: ReactFieldComponentProps<FieldValue, FieldSchema>,
  type: InputHTMLAttributes<HTMLInputElement>["type"],
): InputHTMLAttributes<HTMLInputElement> {
  return {
    id: props.field.id,
    name: props.field.name,
    type,
    placeholder: props.field.placeholder,
    required: props.field.required,
    disabled: props.state.disabled || props.field.disabled === true,
    readOnly: props.state.readonly || props.field.readonly === true,
    "aria-invalid": props.state.errors.length > 0,
    "aria-describedby": props.describedBy,
    onChange(event) {
      props.register.onChange(event);
    },
    onBlur: props.onBlur,
    onFocus: props.onFocus,
  };
}

function baseTextareaProps(
  props: ReactFieldComponentProps<FieldValue, FieldSchema>,
): TextareaHTMLAttributes<HTMLTextAreaElement> {
  return {
    id: props.field.id,
    name: props.field.name,
    placeholder: props.field.placeholder,
    required: props.field.required,
    disabled: props.state.disabled || props.field.disabled === true,
    readOnly: props.state.readonly || props.field.readonly === true,
    "aria-invalid": props.state.errors.length > 0,
    "aria-describedby": props.describedBy,
    onChange(event) {
      props.onChange(event.currentTarget.value);
    },
    onBlur: props.onBlur,
    onFocus: props.onFocus,
  };
}

function baseSelectProps(
  props: ReactFieldComponentProps<FieldValue, FieldSchema>,
): SelectHTMLAttributes<HTMLSelectElement> {
  return {
    id: props.field.id,
    name: props.field.name,
    required: props.field.required,
    disabled: props.state.disabled || props.field.disabled === true,
    "aria-invalid": props.state.errors.length > 0,
    "aria-describedby": props.describedBy,
    onChange(event) {
      if (props.field.type === "multiselect") {
        props.onChange(
          Array.from(event.currentTarget.selectedOptions).map((option) => option.value),
        );
        return;
      }

      props.onChange(event.currentTarget.value);
    },
    onBlur: props.onBlur,
    onFocus: props.onFocus,
  };
}

function createRadioOption(
  props: ReactFieldComponentProps<FieldValue, FieldSchema>,
  option: FieldOption,
): ReactElement {
  const value = String(option.value);

  return createElement(
    "label",
    { key: value },
    createElement("input", {
      type: "radio",
      name: props.field.name,
      value,
      checked: props.value === option.value,
      disabled: props.state.disabled || option.disabled === true,
      required: props.field.required,
      onChange() {
        props.onChange(option.value as FieldValue);
      },
      onBlur: props.onBlur,
      onFocus: props.onFocus,
    }),
    option.label,
  );
}

function normalizeInputValue<TValue extends FieldValue>(
  eventOrValue: ChangeEvent<FormControlElement> | TValue,
  options: RegisterOptions<TValue>,
): TValue {
  if (!isChangeEvent(eventOrValue)) {
    return options.setValueAs ? options.setValueAs(eventOrValue) : eventOrValue;
  }

  const target = eventOrValue.currentTarget;
  let value: unknown;

  if (target instanceof HTMLInputElement && target.type === "checkbox") {
    value = target.checked;
  } else if (target instanceof HTMLInputElement && target.type === "file") {
    value = fileValue(target.files);
  } else if (
    target instanceof HTMLSelectElement &&
    target.multiple
  ) {
    value = Array.from(target.selectedOptions).map((option) => option.value);
  } else {
    value = target.value;
  }

  if (options.valueAsNumber === true && value !== "") {
    value = Number(value);
  }

  if (options.valueAsBoolean === true) {
    value = Boolean(value);
  }

  return options.setValueAs ? options.setValueAs(value) : (value as TValue);
}

function isChangeEvent<TValue extends FieldValue>(
  value: ChangeEvent<FormControlElement> | TValue,
): value is ChangeEvent<FormControlElement> {
  return (
    typeof value === "object" &&
    value !== null &&
    "currentTarget" in value
  );
}

function getFieldStateFromForm<TValue = FieldValue>(
  state: FormState,
  name: string,
): FieldState<TValue> {
  return {
    name,
    value: state.values[name] as TValue | undefined,
    initialValue: state.initialValues[name] as TValue | undefined,
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

function isFormReturn<TValues extends FormValues>(
  value: UseFormReturn<TValues> | FormEngine<TValues>,
): value is UseFormReturn<TValues> {
  return "engine" in value && "register" in value;
}

function createFormReturnFromEngine<TValues extends FormValues>(
  engine: FormEngine<TValues>,
): UseFormReturn<TValues> {
  const state = engine.getState();
  const watch = ((name?: FieldPath<TValues>) => {
    if (name === undefined) {
      return engine.getState().values;
    }

    return engine.getValue(String(name));
  }) as UseFormReturn<TValues>["watch"];

  return {
    engine,
    control: engine,
    state,
    formState: state,
    values: state.values,
    errors: state.errors,
    register(name) {
      return {
        name,
        value: engine.getValue(String(name)),
        checked: undefined,
        onChange(eventOrValue) {
          engine.setValue(
            String(name),
            normalizeInputValue(eventOrValue, {}) as FieldValue,
          );
        },
        onBlur() {
          engine.blur(String(name));
        },
        onFocus() {
          engine.focus(String(name));
        },
        ref() {
          return undefined;
        },
      };
    },
    handleSubmit(onValid, onInvalid) {
      return async (event) => {
        event?.preventDefault();
        const result = await engine.submit();

        if (!result.ok) {
          onInvalid?.(result.errors ?? {}, engine.getState());
          return result;
        }

        return onValid?.(engine.getState().values, {
          schema: engine.getSnapshot().schema,
          state: engine.getState(),
          engine,
        }) ?? result;
      };
    },
    setValue(name, value) {
      engine.setValue(String(name), value);
    },
    getValue(name) {
      return engine.getValue(String(name));
    },
    watch,
    validate: engine.validate,
    validateField(name) {
      return engine.validateField(String(name));
    },
    submit: engine.submit,
    reset: engine.reset,
  };
}

function inputType(type: string): InputHTMLAttributes<HTMLInputElement>["type"] {
  if (type === "phone") {
    return "tel";
  }

  if (type === "datetime") {
    return "datetime-local";
  }

  return type as InputHTMLAttributes<HTMLInputElement>["type"];
}

function stringValue(value: FieldValue | undefined): string {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function numberInputValue(value: FieldValue | undefined): string | number {
  return typeof value === "number" || typeof value === "string" ? value : "";
}

function booleanValue(value: FieldValue | undefined): boolean {
  return value === true;
}

function selectValue(value: FieldValue | undefined, multiple: boolean): string | string[] {
  if (multiple) {
    return Array.isArray(value) ? value.map(String) : [];
  }

  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function numericMetadata(field: FieldSchema, key: "min" | "max" | "step"): number | undefined {
  const value = field.metadata?.[key];

  return typeof value === "number" ? value : undefined;
}

function fileAccept(field: FieldSchema): string | undefined {
  const accept = field.metadata?.accept;

  return typeof accept === "string" ? accept : undefined;
}

function fileValue(files: FileList | null): FileValue | FileValue[] | null {
  if (!files || files.length === 0) {
    return null;
  }

  const values = Array.from(files).map((file) => ({
    name: file.name,
    size: file.size,
    type: file.type,
    file,
  }));

  return values.length === 1 ? values[0] ?? null : values;
}

function compactProps<TProps extends Record<string, unknown>>(props: TProps): TProps {
  const compacted = {} as TProps;

  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) {
      compacted[key as keyof TProps] = value as TProps[keyof TProps];
    }
  }

  return compacted;
}

export type { FieldError, FieldSchema, FieldState, FieldValue, FormErrors };
export type { FormSchema, FormState, FormValues, PrimitiveValue, SubmitResult };
