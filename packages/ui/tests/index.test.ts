import { describe, expect, it } from "vitest";
import {
  Checkbox,
  DatePicker,
  ErrorMessage,
  FieldWrapper,
  FileUpload,
  Input,
  Label,
  OtpInput,
  RadioGroup,
  Rating,
  Select,
  Slider,
  SubmitButton,
  Switch,
  Textarea,
  TimePicker,
} from "../src/index";

describe("default UI component placeholders", () => {
  it("exports null-rendering placeholders for planned components", () => {
    expect(Input({ name: "name" })).toBeNull();
    expect(Textarea({ name: "bio" })).toBeNull();
    expect(Select({ name: "country" })).toBeNull();
    expect(Checkbox({ name: "agree" })).toBeNull();
    expect(RadioGroup({ name: "plan" })).toBeNull();
    expect(Switch({ name: "enabled" })).toBeNull();
    expect(Slider({ name: "volume" })).toBeNull();
    expect(DatePicker({ name: "date" })).toBeNull();
    expect(TimePicker({ name: "time" })).toBeNull();
    expect(FileUpload({ name: "avatar" })).toBeNull();
    expect(Rating({ name: "score" })).toBeNull();
    expect(OtpInput({ name: "code" })).toBeNull();
    expect(Label({ htmlFor: "name" })).toBeNull();
    expect(ErrorMessage({ message: "Required" })).toBeNull();
    expect(FieldWrapper({ children: "Field" })).toBeNull();
    expect(SubmitButton({ type: "submit" })).toBeNull();
  });
});
