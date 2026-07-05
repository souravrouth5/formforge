import { describe, expect, it } from "vitest";
import {
  addBuilderField,
  addBuilderFieldOption,
  createBuilderDocument,
  createBuilderField,
  fieldSupportsOptions,
  getBuilderFieldDefinition,
  listBuilderFields,
  moveBuilderField,
  removeBuilderFieldOption,
  updateBuilderFieldMetadata,
  updateBuilderFieldOption,
} from "../src/index";
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

  it("creates bundled builder fields from package definitions", () => {
    const select = createBuilderField("select", 1);
    const range = createBuilderField("range", 2);
    const file = createBuilderField("file", 3);

    expect(select.type).toBe("select");
    expect(select.options).toHaveLength(3);
    expect(select.defaultValue).toBe("option-a");
    expect(range.metadata).toEqual({ min: 0, max: 100, step: 10 });
    expect(file.metadata).toEqual({ accept: ".pdf", acceptTypes: [".pdf"] });
  });

  it("adds fields by type using bundled defaults", () => {
    const document = createBuilderDocument(schema);
    const updated = addBuilderField(document, "radio");

    expect(updated.schema.fields[0]?.type).toBe("radio");
    expect(updated.schema.fields[0]?.options).toHaveLength(3);
    expect(updated.selectedFieldId).toBe(updated.schema.fields[0]?.id);
  });

  it("updates field options immutably", () => {
    const document = addBuilderField(createBuilderDocument(schema), "select");
    const fieldId = document.selectedFieldId ?? "";
    const added = addBuilderFieldOption(document, fieldId, {
      label: "Enterprise",
      value: "enterprise",
    });
    const renamed = updateBuilderFieldOption(added, fieldId, 0, {
      label: "Starter",
    });
    const removed = removeBuilderFieldOption(renamed, fieldId, 1);

    expect(added.schema.fields[0]?.options).toHaveLength(4);
    expect(renamed.schema.fields[0]?.options?.[0]?.label).toBe("Starter");
    expect(removed.schema.fields[0]?.options).toHaveLength(3);
  });

  it("updates metadata and moves fields immutably", () => {
    const first = addBuilderField(createBuilderDocument(schema), "text");
    const second = addBuilderField(first, "range");
    const rangeId = second.selectedFieldId ?? "";
    const updated = updateBuilderFieldMetadata(second, rangeId, { min: 10 });
    const moved = moveBuilderField(
      updated,
      updated.schema.fields[1]?.id ?? "",
      updated.schema.fields[0]?.id ?? "",
    );

    expect(updated.schema.fields[1]?.metadata?.min).toBe(10);
    expect(moved.schema.fields[0]?.type).toBe("range");
    expect(second.schema.fields[1]?.metadata?.min).toBe(0);
  });

  it("exposes field definitions with related setting metadata", () => {
    const definitions = listBuilderFields();
    const checkbox = getBuilderFieldDefinition("checkbox");
    const select = getBuilderFieldDefinition("select");
    const radio = getBuilderFieldDefinition("radio");
    const file = getBuilderFieldDefinition("file");

    expect(definitions.some((definition) => definition.type === "file")).toBe(true);
    expect(fieldSupportsOptions("select")).toBe(true);
    expect(fieldSupportsOptions("range")).toBe(false);
    expect(checkbox.settings.some((setting) => setting.key === "options")).toBe(true);
    expect(checkbox.settings.some((setting) => setting.key === "selectionMode")).toBe(
      true,
    );
    expect(select.settings.some((setting) => setting.key === "selectionMode")).toBe(
      false,
    );
    expect(radio.settings.some((setting) => setting.key === "selectionMode")).toBe(
      false,
    );
    expect(file.settings.find((setting) => setting.key === "acceptTypes")?.kind).toBe(
      "multiselect",
    );
  });
});
