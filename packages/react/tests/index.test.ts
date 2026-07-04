import { describe, expect, it } from "vitest";
import {
  FieldRenderer,
  Form,
  FormProvider,
  LayoutRenderer,
  useField,
  useForm,
  useFormContext,
  useFormState,
  useWatch,
} from "../src/index";
import type { FieldSchema, FormSchema, FormValues } from "@easy-form-builder/core";

interface LoginValues extends FormValues {
  username: string;
}

const usernameField: FieldSchema = {
  id: "username-field",
  name: "username",
  type: "text",
  defaultValue: "admin",
};

const schema: FormSchema<LoginValues> = {
  id: "login",
  fields: [usernameField],
};

describe("react package API surface", () => {
  it("creates a typed form facade from the core engine", () => {
    const form = useForm<LoginValues>({ schema });

    expect(form.values.username).toBe("admin");

    form.setValue("username", "root");

    expect(form.getValue<string>("username")).toBe("root");
  });

  it("returns null for renderer placeholders until renderer implementation exists", () => {
    expect(Form({ schema })).toBeNull();
    expect(FormProvider({ form: useForm({ schema }), children: null })).toBeNull();
    expect(FieldRenderer({ field: usernameField })).toBeNull();
    expect(LayoutRenderer({ schema, children: null })).toBeNull();
  });

  it("throws clear errors for unimplemented hook placeholders", () => {
    expect(() => useField({ name: "username" })).toThrow(
      "useField requires the React renderer implementation.",
    );
    expect(() => useWatch()).toThrow(
      "useWatch requires the React renderer implementation.",
    );
    expect(() => useFormContext()).toThrow(
      "useFormContext requires FormProvider implementation.",
    );
    expect(() => useFormState()).toThrow(
      "useFormContext requires FormProvider implementation.",
    );
  });
});
