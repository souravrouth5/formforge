import { describe, expect, it, vi } from "vitest";
import {
  FormBuilderError,
  createEventBus,
  createFieldRegistry,
  createFormEngine,
  createPluginManager,
  createSchemaError,
  createValidationManager,
  isFieldSchema,
  isFormSchema,
  isRecord,
  normalizeSchema,
  parseSchema,
} from "../src/index";
import type {
  FieldError,
  FormPlugin,
  FormSchema,
  FormValues,
  PluginContext,
  SubmitContext,
  ValidationAdapter,
} from "../src/index";

interface ContactValues extends FormValues {
  name: string;
  email: string;
}

const contactSchema: FormSchema<ContactValues> = {
  id: "contact",
  fields: [
    {
      id: "name-field",
      name: "name",
      type: "text",
      defaultValue: "Ada",
    },
    {
      id: "email-field",
      name: "email",
      type: "email",
      defaultValue: "",
    },
  ],
};

describe("runtime type guards", () => {
  it("narrows plain records and rejects arrays/null", () => {
    expect(isRecord({ id: "x" })).toBe(true);
    expect(isRecord(null)).toBe(false);
    expect(isRecord(["x"])).toBe(false);
  });

  it("recognizes field schemas by required runtime keys", () => {
    expect(isFieldSchema({ id: "first", name: "firstName", type: "text" })).toBe(
      true,
    );
    expect(isFieldSchema({ id: "first", type: "text" })).toBe(false);
  });

  it("recognizes form schemas only when fields are valid", () => {
    expect(isFormSchema(contactSchema)).toBe(true);
    expect(isFormSchema({ id: "broken", fields: [{ id: "field" }] })).toBe(false);
    expect(isFormSchema({ id: "broken" })).toBe(false);
  });
});

describe("schema parsing", () => {
  it("parses unknown input into a form schema", () => {
    const parsed = parseSchema<ContactValues>(contactSchema);

    expect(parsed.id).toBe("contact");
    expect(parsed.fields).toHaveLength(2);
  });

  it("throws a schema error for invalid input", () => {
    expect(() => parseSchema({ id: "invalid" })).toThrow(FormBuilderError);
    expect(() => parseSchema({ id: "invalid" })).toThrow("Invalid form schema.");
  });

  it("rejects duplicate field ids during normalization", () => {
    const duplicateSchema: FormSchema = {
      id: "duplicate",
      fields: [
        { id: "field", name: "first", type: "text" },
        { id: "field", name: "second", type: "text" },
      ],
    };

    expect(() => normalizeSchema(duplicateSchema)).toThrow(
      'Duplicate field id "field".',
    );
  });

  it("creates structured schema errors", () => {
    const error = createSchemaError("Invalid field.", { path: "fields.0" });

    expect(error).toBeInstanceOf(FormBuilderError);
    expect(error.type).toBe("schema");
    expect(error.metadata).toEqual({ path: "fields.0" });
  });
});

describe("field registry", () => {
  it("registers, replaces, lists, and unregisters definitions", () => {
    const registry = createFieldRegistry([{ type: "text" }]);

    expect(registry.has("text")).toBe(true);
    expect(registry.list()).toHaveLength(1);

    registry.register({ type: "text", schema: { label: "Text Input" } });

    expect(registry.get("text")?.schema?.label).toBe("Text Input");

    registry.unregister("text");

    expect(registry.has("text")).toBe(false);
  });
});

describe("event bus", () => {
  it("emits typed events to subscribers", async () => {
    const events = createEventBus<ContactValues>();
    const handler = vi.fn<(payload: { name: string }) => void>();

    events.on("focus", handler);

    await events.emit("focus", { name: "email" });

    expect(handler).toHaveBeenCalledWith({ name: "email" });
  });

  it("supports one-time subscribers", async () => {
    const events = createEventBus<ContactValues>();
    const handler = vi.fn<(payload: { name: string }) => void>();

    events.once("blur", handler);

    await events.emit("blur", { name: "name" });
    await events.emit("blur", { name: "email" });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ name: "name" });
  });

  it("unsubscribes regular subscribers", async () => {
    const events = createEventBus<ContactValues>();
    const handler = vi.fn<(payload: { name: string }) => void>();
    const unsubscribe = events.on("focus", handler);

    unsubscribe();
    await events.emit("focus", { name: "name" });

    expect(handler).not.toHaveBeenCalled();
  });
});

describe("plugin manager", () => {
  it("sets up plugins and runs cleanups in reverse order", async () => {
    const calls: string[] = [];
    const context = createPluginContext();
    const firstPlugin: FormPlugin<Record<string, unknown>, ContactValues> = {
      name: "first",
      setup() {
        calls.push("setup:first");
        return () => {
          calls.push("cleanup:first");
        };
      },
    };
    const secondPlugin: FormPlugin<Record<string, unknown>, ContactValues> = {
      name: "second",
      setup() {
        calls.push("setup:second");
        return () => {
          calls.push("cleanup:second");
        };
      },
    };
    const manager = createPluginManager([firstPlugin, secondPlugin]);

    manager.setupAll(context);
    await manager.cleanupAll();

    expect(calls).toEqual([
      "setup:first",
      "setup:second",
      "cleanup:second",
      "cleanup:first",
    ]);
  });
});

describe("validation manager", () => {
  it("returns a valid result when no adapter is configured", async () => {
    const engine = createFormEngine({ schema: contactSchema });
    const manager = createValidationManager(contactSchema);

    await expect(manager.validate(engine.getState())).resolves.toEqual({
      valid: true,
      errors: {},
    });
  });

  it("delegates form and field validation to the adapter", async () => {
    const fieldError: FieldError = {
      name: "email",
      message: "Email is required.",
      type: "required",
    };
    const adapter: ValidationAdapter<unknown, ContactValues> = {
      name: "test",
      validateForm(values) {
        return {
          valid: values.email.length > 0,
          errors: { email: [fieldError] },
        };
      },
      validateField(name, value, context) {
        expect(name).toBe("email");
        expect(value).toBe("");
        expect(context.field?.id).toBe("email-field");

        return { valid: false, error: fieldError };
      },
    };
    const engine = createFormEngine({ schema: contactSchema });
    const manager = createValidationManager(contactSchema, adapter);

    await expect(manager.validate(engine.getState())).resolves.toEqual({
      valid: false,
      errors: { email: [fieldError] },
    });
    await expect(manager.validateField("email", engine.getState())).resolves.toEqual({
      valid: false,
      error: fieldError,
    });
  });
});

describe("form engine", () => {
  it("initializes state from field defaults and explicit defaults", () => {
    const engine = createFormEngine({
      schema: contactSchema,
      defaultValues: { email: "ada@example.com" },
    });

    expect(engine.getState().values).toEqual({
      name: "Ada",
      email: "ada@example.com",
    });
    expect(engine.getValue<string>("name")).toBe("Ada");
  });

  it("updates values, marks fields dirty, and notifies subscribers", () => {
    const engine = createFormEngine({ schema: contactSchema });
    const formListener = vi.fn<(values: ContactValues) => void>();
    const fieldListener = vi.fn<(value: unknown) => void>();

    engine.subscribe((state) => formListener(state.values));
    engine.subscribeField("name", (state) => fieldListener(state.value));
    engine.setValue("name", "Grace");

    expect(engine.getValue<string>("name")).toBe("Grace");
    expect(engine.getState().dirty.name).toBe(true);
    expect(formListener).toHaveBeenCalledWith({ name: "Grace", email: "" });
    expect(fieldListener).toHaveBeenCalledWith("Grace");
  });

  it("tracks touch, focus, blur, and visited state", () => {
    const engine = createFormEngine({ schema: contactSchema });

    engine.focus("email");

    expect(engine.getState().focused).toBe("email");
    expect(engine.getState().visited.email).toBe(true);

    engine.blur("email");

    expect(engine.getState().focused).toBeNull();
    expect(engine.getState().touched.email).toBe(true);

    engine.touch("name");

    expect(engine.getState().touched.name).toBe(true);
    expect(engine.getState().visited.name).toBe(true);
  });

  it("validates through an adapter and stores normalized errors", async () => {
    const error: FieldError = {
      name: "email",
      message: "Email is required.",
    };
    const adapter: ValidationAdapter<unknown, ContactValues> = {
      name: "test",
      validateForm() {
        return { valid: false, errors: { email: [error] } };
      },
      validateField() {
        return { valid: false, error };
      },
    };
    const engine = createFormEngine({
      schema: contactSchema,
      validationAdapter: adapter,
    });

    await expect(engine.validate()).resolves.toEqual({
      valid: false,
      errors: { email: [error] },
    });
    expect(engine.getState().valid).toBe(false);
    expect(engine.getState().errors.email).toEqual([error]);

    await expect(engine.validateField("email")).resolves.toEqual({
      valid: false,
      error,
    });
    expect(engine.getState().errors.email).toEqual([error]);
  });

  it("submits successful forms and updates submission state", async () => {
    const submittedValues: ContactValues[] = [];
    let submittedSchemaId = "";
    const submitHandler = vi.fn(
      (values: ContactValues, context: SubmitContext<ContactValues>) => {
        submittedValues.push(values);
        submittedSchemaId = context.schema.id;

        return {
          ok: true,
          data: { received: values.name },
        };
      },
    );
    const engine = createFormEngine({
      schema: {
        ...contactSchema,
        submit: {
          handler: submitHandler,
        },
      },
    });

    await expect(engine.submit()).resolves.toEqual({
      ok: true,
      data: { received: "Ada" },
    });
    expect(submitHandler).toHaveBeenCalledTimes(1);
    expect(submittedValues).toEqual([{ name: "Ada", email: "" }]);
    expect(submittedSchemaId).toBe("contact");
    expect(engine.getState().submitted).toBe(true);
    expect(engine.getState().submitting).toBe(false);
    expect(engine.getState().submitCount).toBe(1);
  });

  it("blocks submission when validation fails", async () => {
    const error: FieldError = {
      name: "email",
      message: "Email is required.",
    };
    const submitHandler = vi.fn();
    const engine = createFormEngine({
      schema: {
        ...contactSchema,
        submit: {
          handler: submitHandler,
        },
      },
      validationAdapter: {
        name: "test",
        validateForm() {
          return { valid: false, errors: { email: [error] } };
        },
      },
    });

    await expect(engine.submit()).resolves.toEqual({
      ok: false,
      errors: { email: [error] },
      message: "Validation failed.",
    });
    expect(submitHandler).not.toHaveBeenCalled();
    expect(engine.getState().submitted).toBe(true);
  });

  it("resets values to schema defaults plus provided overrides", () => {
    const engine = createFormEngine({ schema: contactSchema });

    engine.setValue("name", "Grace");
    engine.reset({ email: "reset@example.com" });

    expect(engine.getState().values).toEqual({
      name: "Ada",
      email: "reset@example.com",
    });
    expect(engine.getState().dirty).toEqual({});
  });

  it("registers schema field types in the provided registry", () => {
    const registry = createFieldRegistry();

    createFormEngine({ schema: contactSchema, registry });

    expect(registry.has("text")).toBe(true);
    expect(registry.has("email")).toBe(true);
  });

  it("runs plugin setup with access to the engine and registry", () => {
    const setup = vi.fn((context: PluginContext<ContactValues>) => {
      expect(context.schema.id).toBe("contact");
      expect(context.engine.getValue("name")).toBe("Ada");
      expect(context.registry.has("text")).toBe(true);
    });
    const plugin: FormPlugin<Record<string, unknown>, ContactValues> = {
      name: "assert-context",
      setup,
    };

    createFormEngine({ schema: contactSchema, plugins: [plugin] });

    expect(setup).toHaveBeenCalledTimes(1);
  });

  it("prevents access after destroy", () => {
    const engine = createFormEngine({ schema: contactSchema });

    engine.destroy();

    expect(() => engine.getState()).toThrow("Cannot use a destroyed form engine.");
  });
});

function createPluginContext(): PluginContext<ContactValues> {
  const registry = createFieldRegistry();
  const engine = createFormEngine({ schema: contactSchema, registry });

  return {
    schema: contactSchema,
    engine,
    events: createEventBus<ContactValues>(),
    registry,
  };
}
