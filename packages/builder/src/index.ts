import type {
  FieldOption,
  FieldSchema,
  FieldType,
  FieldValue,
  FormSchema,
  FormValues,
} from "@easy-form-builder/core";

export type BuilderFieldType =
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "phone"
  | "range"
  | "radio"
  | "select"
  | "checkbox"
  | "date"
  | "time"
  | "file";

export type BuilderSettingKind =
  | "text"
  | "number"
  | "boolean"
  | "select"
  | "multiselect"
  | "options";

export interface BuilderSettingDefinition {
  key: string;
  label: string;
  kind: BuilderSettingKind;
  target: "field" | "metadata" | "options";
  options?: FieldOption<string>[];
}

export interface BuilderFieldDefinition {
  type: BuilderFieldType;
  label: string;
  description: string;
  defaultSpan: number;
  defaultValue: FieldValue;
  defaultOptions?: FieldOption[];
  defaultMetadata?: Record<string, unknown>;
  settings: BuilderSettingDefinition[];
}

export interface BuilderDocument<TValues extends FormValues = FormValues> {
  schema: FormSchema<TValues>;
  selectedFieldId?: string;
  metadata?: Record<string, unknown>;
}

export function createBuilderDocument<TValues extends FormValues = FormValues>(
  schema: FormSchema<TValues>,
): BuilderDocument<TValues> {
  return { schema };
}

export function addBuilderField<TValues extends FormValues = FormValues>(
  document: BuilderDocument<TValues>,
  fieldOrType: FieldSchema | BuilderFieldType,
): BuilderDocument<TValues> {
  const field =
    typeof fieldOrType === "string"
      ? createBuilderField(fieldOrType, document.schema.fields.length + 1)
      : fieldOrType;

  return {
    ...document,
    schema: {
      ...document.schema,
      fields: [...document.schema.fields, field],
    },
    selectedFieldId: field.id,
  };
}

export function selectBuilderField<TValues extends FormValues = FormValues>(
  document: BuilderDocument<TValues>,
  fieldId: string,
): BuilderDocument<TValues> {
  return { ...document, selectedFieldId: fieldId };
}

export function updateBuilderField<TValues extends FormValues = FormValues>(
  document: BuilderDocument<TValues>,
  fieldId: string,
  patch: Partial<FieldSchema>,
): BuilderDocument<TValues> {
  return {
    ...document,
    schema: {
      ...document.schema,
      fields: document.schema.fields.map((field) =>
        field.id === fieldId ? { ...cloneField(field), ...patch } : field,
      ),
    },
  };
}

export function updateBuilderFieldMetadata<
  TValues extends FormValues = FormValues,
>(
  document: BuilderDocument<TValues>,
  fieldId: string,
  metadata: Record<string, unknown>,
): BuilderDocument<TValues> {
  const field = document.schema.fields.find((item) => item.id === fieldId);

  if (!field) {
    return document;
  }

  return updateBuilderField(document, fieldId, {
    metadata: {
      ...(field.metadata ?? {}),
      ...metadata,
    },
  });
}

export function removeBuilderField<TValues extends FormValues = FormValues>(
  document: BuilderDocument<TValues>,
  fieldId: string,
): BuilderDocument<TValues> {
  const fields = document.schema.fields.filter((field) => field.id !== fieldId);
  const selectedFieldId =
    document.selectedFieldId === fieldId ? fields[0]?.id : document.selectedFieldId;
  const nextDocument: BuilderDocument<TValues> = {
    ...document,
    schema: {
      ...document.schema,
      fields,
    },
  };

  if (selectedFieldId !== undefined) {
    nextDocument.selectedFieldId = selectedFieldId;
  }

  return nextDocument;
}

export function moveBuilderField<TValues extends FormValues = FormValues>(
  document: BuilderDocument<TValues>,
  sourceFieldId: string,
  targetFieldId: string,
): BuilderDocument<TValues> {
  const from = document.schema.fields.findIndex((field) => field.id === sourceFieldId);
  const to = document.schema.fields.findIndex((field) => field.id === targetFieldId);

  if (from < 0 || to < 0 || from === to) {
    return document;
  }

  const fields = [...document.schema.fields];
  const [field] = fields.splice(from, 1);

  if (!field) {
    return document;
  }

  fields.splice(to, 0, field);

  return {
    ...document,
    schema: {
      ...document.schema,
      fields,
    },
  };
}

export function addBuilderFieldOption<TValues extends FormValues = FormValues>(
  document: BuilderDocument<TValues>,
  fieldId: string,
  option?: FieldOption,
): BuilderDocument<TValues> {
  const field = document.schema.fields.find((item) => item.id === fieldId);

  if (!field) {
    return document;
  }

  const options = field.options ?? [];
  const nextIndex = options.length + 1;
  const nextOption = option ?? {
    label: `Option ${nextIndex}`,
    value: `option-${nextIndex}`,
  };

  return updateBuilderField(document, fieldId, {
    options: [...options, nextOption],
    defaultValue: field.defaultValue ?? nextOption.value,
  });
}

export function updateBuilderFieldOption<
  TValues extends FormValues = FormValues,
>(
  document: BuilderDocument<TValues>,
  fieldId: string,
  optionIndex: number,
  patch: Partial<FieldOption>,
): BuilderDocument<TValues> {
  const field = document.schema.fields.find((item) => item.id === fieldId);

  if (!field?.options?.[optionIndex]) {
    return document;
  }

  return updateBuilderField(document, fieldId, {
    options: field.options.map((option, index) =>
      index === optionIndex ? { ...option, ...patch } : option,
    ),
  });
}

export function removeBuilderFieldOption<
  TValues extends FormValues = FormValues,
>(
  document: BuilderDocument<TValues>,
  fieldId: string,
  optionIndex: number,
): BuilderDocument<TValues> {
  const field = document.schema.fields.find((item) => item.id === fieldId);

  if (!field?.options?.[optionIndex]) {
    return document;
  }

  const options = field.options.filter((_, index) => index !== optionIndex);

  return updateBuilderField(document, fieldId, {
    options,
    defaultValue: options[0]?.value ?? "",
  });
}

export function listBuilderFields(): BuilderFieldDefinition[] {
  return BUILDER_FIELD_DEFINITIONS.map(cloneDefinition);
}

export function getBuilderFieldDefinition(
  type: BuilderFieldType,
): BuilderFieldDefinition {
  const definition = BUILDER_FIELD_DEFINITIONS.find((item) => item.type === type);

  if (!definition) {
    throw new Error(`Unknown builder field type "${type}".`);
  }

  return cloneDefinition(definition);
}

export function createBuilderField(
  type: BuilderFieldType,
  index = 1,
  overrides: Partial<FieldSchema> = {},
): FieldSchema {
  const definition = getBuilderFieldDefinition(type);
  const label = overrides.label ?? `${definition.label} ${index}`;
  const field: FieldSchema = {
    id: overrides.id ?? `${type}-${Date.now()}-${index}`,
    name: overrides.name ?? slugName(label),
    type: type as FieldType,
    label,
    placeholder: overrides.placeholder ?? getDefaultPlaceholder(type),
    defaultValue: overrides.defaultValue ?? definition.defaultValue,
    layout: overrides.layout ?? { span: definition.defaultSpan },
  };

  if (definition.defaultOptions) {
    field.options = definition.defaultOptions.map((option) => ({ ...option }));
  }

  if (definition.defaultMetadata) {
    field.metadata = { ...definition.defaultMetadata };
  }

  return { ...field, ...overrides };
}

export function fieldSupportsOptions(fieldOrType: FieldSchema | BuilderFieldType): boolean {
  const type = typeof fieldOrType === "string" ? fieldOrType : fieldOrType.type;

  return type === "select" || type === "radio" || type === "checkbox";
}

export function slugName(value: string): string {
  const slug = value
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part, index) => {
      const lower = part.toLowerCase();
      return index === 0
        ? lower
        : `${lower.charAt(0).toUpperCase()}${lower.slice(1)}`;
    })
    .join("");

  return slug || "field";
}

function getDefaultPlaceholder(type: BuilderFieldType): string {
  switch (type) {
    case "date":
      return "Please select a date";
    case "time":
      return "Please select a time";
    case "select":
    case "radio":
    case "checkbox":
      return "Please select an option";
    case "file":
      return "Please upload a file";
    case "number":
    case "range":
      return "Enter a number";
    case "email":
      return "Enter email address";
    case "phone":
      return "Enter phone number";
    case "textarea":
      return "Enter details";
    case "text":
    default:
      return "Enter value";
  }
}

function cloneField(field: FieldSchema): FieldSchema {
  const cloned: FieldSchema = {
    ...field,
  };

  if (field.options !== undefined) {
    cloned.options = field.options.map((option) => ({ ...option }));
  }

  if (field.metadata !== undefined) {
    cloned.metadata = { ...field.metadata };
  }

  if (field.layout !== undefined) {
    cloned.layout = { ...field.layout };
  }

  return cloned;
}

function cloneDefinition(definition: BuilderFieldDefinition): BuilderFieldDefinition {
  const cloned: BuilderFieldDefinition = {
    ...definition,
    settings: definition.settings.map((setting) => {
      const clonedSetting: BuilderSettingDefinition = { ...setting };

      if (setting.options !== undefined) {
        clonedSetting.options = setting.options.map((option) => ({ ...option }));
      }

      return clonedSetting;
    }),
  };

  if (definition.defaultOptions !== undefined) {
    cloned.defaultOptions = definition.defaultOptions.map((option) => ({ ...option }));
  }

  if (definition.defaultMetadata !== undefined) {
    cloned.defaultMetadata = { ...definition.defaultMetadata };
  }

  return cloned;
}

const commonSettings: BuilderSettingDefinition[] = [
  { key: "label", label: "Label", kind: "text", target: "field" },
  { key: "name", label: "Name", kind: "text", target: "field" },
  { key: "placeholder", label: "Placeholder", kind: "text", target: "field" },
  { key: "required", label: "Required", kind: "boolean", target: "field" },
];

const optionSettings: BuilderSettingDefinition[] = [
  { key: "options", label: "Options", kind: "options", target: "options" },
];

const checkboxOptionSettings: BuilderSettingDefinition[] = [
  { key: "options", label: "Options", kind: "options", target: "options" },
  {
    key: "selectionMode",
    label: "Selection mode",
    kind: "select",
    target: "metadata",
    options: [
      { label: "Single", value: "single" },
      { label: "Multiple", value: "multiple" },
    ],
  },
];

const BUILDER_FIELD_DEFINITIONS: BuilderFieldDefinition[] = [
  {
    type: "text",
    label: "Text",
    description: "Single-line text input.",
    defaultSpan: 6,
    defaultValue: "",
    settings: commonSettings,
  },
  {
    type: "textarea",
    label: "Textarea",
    description: "Multi-line text input.",
    defaultSpan: 12,
    defaultValue: "",
    settings: commonSettings,
  },
  {
    type: "number",
    label: "Number",
    description: "Numeric input.",
    defaultSpan: 6,
    defaultValue: 0,
    settings: commonSettings,
  },
  {
    type: "email",
    label: "Email",
    description: "Email input.",
    defaultSpan: 6,
    defaultValue: "",
    settings: commonSettings,
  },
  {
    type: "phone",
    label: "Phone",
    description: "Phone number input.",
    defaultSpan: 6,
    defaultValue: "",
    settings: commonSettings,
  },
  {
    type: "range",
    label: "Range",
    description: "Slider with min, max, and step options.",
    defaultSpan: 6,
    defaultValue: 50,
    defaultMetadata: { min: 0, max: 100, step: 10 },
    settings: [
      ...commonSettings,
      { key: "min", label: "Min", kind: "number", target: "metadata" },
      { key: "max", label: "Max", kind: "number", target: "metadata" },
      { key: "step", label: "Step", kind: "number", target: "metadata" },
      { key: "defaultValue", label: "Default value", kind: "number", target: "field" },
    ],
  },
  {
    type: "radio",
    label: "Radio",
    description: "Single-selection option group.",
    defaultSpan: 12,
    defaultValue: "",
    defaultOptions: [
      { label: "Option A", value: "option-a" },
      { label: "Option B", value: "option-b" },
      { label: "Option C", value: "option-c" },
    ],
    defaultMetadata: { selectionMode: "single" },
    settings: [...commonSettings, ...optionSettings],
  },
  {
    type: "select",
    label: "Select",
    description: "Select dropdown with editable options.",
    defaultSpan: 6,
    defaultValue: "",
    defaultOptions: [
      { label: "Option A", value: "option-a" },
      { label: "Option B", value: "option-b" },
      { label: "Option C", value: "option-c" },
    ],
    defaultMetadata: { selectionMode: "single" },
    settings: [...commonSettings, ...optionSettings],
  },
  {
    type: "checkbox",
    label: "Checkbox",
    description: "Boolean checkbox or multi-option checkbox group.",
    defaultSpan: 12,
    defaultValue: [],
    defaultOptions: [
      { label: "Option A", value: "option-a" },
      { label: "Option B", value: "option-b" },
      { label: "Option C", value: "option-c" },
    ],
    defaultMetadata: { selectionMode: "multiple" },
    settings: [...commonSettings, ...checkboxOptionSettings],
  },
  {
    type: "date",
    label: "Date",
    description: "Date input with format metadata.",
    defaultSpan: 6,
    defaultValue: "",
    defaultMetadata: { dateFormat: "yyyy-MM-dd" },
    settings: [
      ...commonSettings,
      {
        key: "dateFormat",
        label: "Date format",
        kind: "select",
        target: "metadata",
        options: [
          { label: "yyyy-MM-dd", value: "yyyy-MM-dd" },
          { label: "dd/MM/yyyy", value: "dd/MM/yyyy" },
          { label: "MM/dd/yyyy", value: "MM/dd/yyyy" },
          { label: "dd MMM yyyy", value: "dd MMM yyyy" },
        ],
      },
    ],
  },
  {
    type: "time",
    label: "Time",
    description: "Time input with format metadata.",
    defaultSpan: 6,
    defaultValue: "",
    defaultMetadata: { timeFormat: "HH:mm" },
    settings: [
      ...commonSettings,
      {
        key: "timeFormat",
        label: "Time format",
        kind: "select",
        target: "metadata",
        options: [
          { label: "HH:mm", value: "HH:mm" },
          { label: "hh:mm a", value: "hh:mm a" },
          { label: "HH:mm:ss", value: "HH:mm:ss" },
        ],
      },
    ],
  },
  {
    type: "file",
    label: "File",
    description: "File upload input with accepted type metadata.",
    defaultSpan: 6,
    defaultValue: null,
    defaultMetadata: { accept: ".pdf", acceptTypes: [".pdf"] },
    settings: [
      ...commonSettings,
      {
        key: "acceptTypes",
        label: "Accepted file types",
        kind: "multiselect",
        target: "metadata",
        options: [
          { label: "PDF", value: ".pdf" },
          { label: "Images", value: "image/*" },
          { label: "Documents", value: ".doc,.docx,.txt" },
          { label: "Spreadsheets", value: ".csv,.xls,.xlsx" },
          { label: "Any file", value: "" },
        ],
      },
    ],
  },
];
