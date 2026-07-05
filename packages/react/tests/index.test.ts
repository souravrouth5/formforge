import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FieldRenderer, Form, FormProvider, LayoutRenderer } from "../src/index";
import { createFormEngine } from "@easy-form-builder/core";
import type { FieldSchema, FormSchema, FormValues } from "@easy-form-builder/core";

interface LeadValues extends FormValues {
  name: string;
  age: number;
  email: string;
  phone: string;
  budget: number;
  plan: string;
  source: string;
  startDate: string;
  startTime: string;
}

const fields: FieldSchema[] = [
  { id: "name-field", name: "name", type: "text", label: "Name", defaultValue: "" },
  { id: "age-field", name: "age", type: "number", label: "Age", defaultValue: 30 },
  {
    id: "email-field",
    name: "email",
    type: "email",
    label: "Email",
    defaultValue: "",
  },
  {
    id: "phone-field",
    name: "phone",
    type: "phone",
    label: "Phone",
    defaultValue: "",
  },
  {
    id: "budget-field",
    name: "budget",
    type: "range",
    label: "Budget",
    defaultValue: 50,
    metadata: { min: 0, max: 100, step: 5 },
  },
  {
    id: "plan-field",
    name: "plan",
    type: "select",
    label: "Plan",
    defaultValue: "pro",
    options: [
      { label: "Starter", value: "starter" },
      { label: "Pro", value: "pro" },
    ],
  },
  {
    id: "source-field",
    name: "source",
    type: "radio",
    label: "Source",
    defaultValue: "search",
    options: [
      { label: "Search", value: "search" },
      { label: "Referral", value: "referral" },
    ],
  },
  {
    id: "date-field",
    name: "startDate",
    type: "date",
    label: "Start date",
    defaultValue: "",
  },
  {
    id: "time-field",
    name: "startTime",
    type: "time",
    label: "Start time",
    defaultValue: "",
  },
  {
    id: "file-field",
    name: "attachment",
    type: "file",
    label: "Attachment",
    metadata: { accept: ".pdf" },
  },
];

const schema: FormSchema<LeadValues> = {
  id: "lead",
  fields,
};

describe("react renderer", () => {
  it("renders schema-driven default fields for common form controls", () => {
    const html = renderToStaticMarkup(createElement(Form<LeadValues>, { schema }));

    expect(html).toContain('type="text"');
    expect(html).toContain('type="number"');
    expect(html).toContain('type="email"');
    expect(html).toContain('type="tel"');
    expect(html).toContain('type="range"');
    expect(html).toContain("<select");
    expect(html).toContain('role="radiogroup"');
    expect(html).toContain('type="date"');
    expect(html).toContain('type="time"');
    expect(html).toContain('type="file"');
    expect(html).toContain('accept=".pdf"');
  });

  it("renders fields inside a provider with an existing engine", () => {
    const engine = createFormEngine({ schema });
    const html = renderToStaticMarkup(
      createElement(
        FormProvider,
        { form: engine },
        createElement(FieldRenderer, { field: fields[0] as FieldSchema }),
      ),
    );

    expect(html).toContain('data-field="name"');
    expect(html).toContain('value=""');
  });

  it("renders a layout wrapper around provided children", () => {
    const html = renderToStaticMarkup(
      createElement(
        LayoutRenderer<LeadValues>,
        { schema },
        createElement("span", null, "Child"),
      ),
    );

    expect(html).toContain('data-form-layout="stack"');
    expect(html).toContain("Child");
  });
});
