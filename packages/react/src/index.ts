import type {
  FieldError,
  FieldSchema,
  FieldState,
  FieldValue,
  FormEngine,
  FormEngineOptions,
  FormErrors,
  FormPlugin,
  FormSchema,
  FormState,
  FormValues,
  SubmitHandler,
  SubmitResult,
  ValidationAdapter,
  ValidationResult,
} from "@easy-form-builder/core";
import { createFormEngine } from "@easy-form-builder/core";
import type { ComponentType, CSSProperties, ReactNode } from "react";

export interface ReactFieldComponentProps<
  TValue = FieldValue,
  TField extends FieldSchema = FieldSchema,
> {
  field: TField;
  value: TValue | undefined;
  state: FieldState<TValue>;
  onChange(value: TValue): void;
  onBlur(): void;
  onFocus(): void;
  errorId?: string;
  describedBy?: string;
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
  children: ReactNode;
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
  schema?: FormSchema<TValues>;
  children?: ReactNode;
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
}

export interface FormProviderProps<TValues extends FormValues = FormValues> {
  form: UseFormReturn<TValues> | FormEngine<TValues>;
  children: ReactNode;
}

export interface FieldRendererProps {
  field: FieldSchema;
}

export interface UseFormOptions<TValues extends FormValues = FormValues> {
  schema?: FormSchema<TValues>;
  defaultValues?: Partial<TValues>;
  validationAdapter?: ValidationAdapter<unknown, TValues>;
  plugins?: FormPlugin<Record<string, unknown>, TValues>[];
}

export interface UseFormReturn<TValues extends FormValues = FormValues> {
  engine: FormEngine<TValues>;
  state: FormState<TValues>;
  values: TValues;
  errors: FormErrors;
  setValue<TValue extends FieldValue = FieldValue>(name: string, value: TValue): void;
  getValue<TValue extends FieldValue = FieldValue>(name: string): TValue | undefined;
  validate(): Promise<ValidationResult>;
  submit(): Promise<SubmitResult>;
  reset(values?: Partial<TValues>): void;
}

export interface UseFieldOptions<TValue = FieldValue> {
  name: string;
  defaultValue?: TValue;
}

export interface UseFieldReturn<TValue = FieldValue> {
  value: TValue | undefined;
  state: FieldState<TValue>;
  errors: FieldError[];
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

export function useForm<TValues extends FormValues = FormValues>(
  options: UseFormOptions<TValues> = {},
): UseFormReturn<TValues> {
  const schema = options.schema ?? ({ id: "form", fields: [] } as FormSchema<TValues>);
  const engineOptions: FormEngineOptions<TValues> = {
    schema,
  };

  if (options.defaultValues !== undefined) {
    engineOptions.defaultValues = options.defaultValues;
  }

  if (options.validationAdapter !== undefined) {
    engineOptions.validationAdapter = options.validationAdapter;
  }

  if (options.plugins !== undefined) {
    engineOptions.plugins = options.plugins;
  }

  const engine = createFormEngine(engineOptions);
  const state = engine.getState();

  return {
    engine,
    state,
    values: state.values,
    errors: state.errors,
    setValue: engine.setValue,
    getValue: engine.getValue,
    validate: engine.validate,
    submit: engine.submit,
    reset: engine.reset,
  };
}

export function useField<TValue = FieldValue>(
  _options: UseFieldOptions<TValue>,
): UseFieldReturn<TValue> {
  throw new Error("useField requires the React renderer implementation.");
}

export function useWatch<TValues extends FormValues = FormValues>(
  _options: UseWatchOptions = {},
): UseWatchReturn<TValues> {
  throw new Error("useWatch requires the React renderer implementation.");
}

export function useFormContext<
  TValues extends FormValues = FormValues,
>(): UseFormReturn<TValues> {
  throw new Error("useFormContext requires FormProvider implementation.");
}

export function useFormState<TValues extends FormValues = FormValues>(): FormState<TValues> {
  return useFormContext<TValues>().state;
}

export function Form<TValues extends FormValues = FormValues>(
  _props: FormProps<TValues>,
): null {
  return null;
}

export function FormProvider<TValues extends FormValues = FormValues>(
  _props: FormProviderProps<TValues>,
): null {
  return null;
}

export function FieldRenderer(_props: FieldRendererProps): null {
  return null;
}

export function LayoutRenderer<TValues extends FormValues = FormValues>(
  _props: LayoutRendererProps<TValues>,
): null {
  return null;
}
