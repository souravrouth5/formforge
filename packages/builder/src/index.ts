import type { FieldSchema, FormSchema, FormValues } from "@easy-form-builder/core";

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
  field: FieldSchema,
): BuilderDocument<TValues> {
  return {
    ...document,
    schema: {
      ...document.schema,
      fields: [...document.schema.fields, field],
    },
    selectedFieldId: field.id,
  };
}

