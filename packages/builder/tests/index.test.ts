import { describe, expect, it } from "vitest";
import { addBuilderField, createBuilderDocument } from "../src/index";
import type { FieldSchema, FormSchema } from "@easy-form-builder/core";

const schema: FormSchema = {
  id: "builder-form",
  fields: [],
};

describe("builder document helpers", () => {
  it("creates a builder document from a form schema", () => {
    const document = createBuilderDocument(schema);

    expect(document.schema).toBe(schema);
    expect(document.selectedFieldId).toBeUndefined();
  });

  it("adds a field immutably and selects the added field", () => {
    const document = createBuilderDocument(schema);
    const field: FieldSchema = {
      id: "name-field",
      name: "name",
      type: "text",
    };
    const updated = addBuilderField(document, field);

    expect(updated).not.toBe(document);
    expect(updated.schema.fields).toEqual([field]);
    expect(updated.selectedFieldId).toBe("name-field");
    expect(document.schema.fields).toEqual([]);
  });
});
