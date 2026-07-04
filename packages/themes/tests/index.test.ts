import { describe, expect, it } from "vitest";
import {
  bootstrapTheme,
  defaultTheme,
  minimalTheme,
  muiTheme,
  shadcnTheme,
  tailwindTheme,
} from "../src/index";

describe("theme presets", () => {
  it("exports named official themes", () => {
    expect(defaultTheme.name).toBe("default");
    expect(minimalTheme.name).toBe("minimal");
    expect(shadcnTheme.name).toBe("shadcn");
    expect(muiTheme.name).toBe("mui");
    expect(bootstrapTheme.name).toBe("bootstrap");
    expect(tailwindTheme.name).toBe("tailwind");
  });

  it("keeps theme tokens appearance-only", () => {
    expect(defaultTheme.tokens).toEqual(
      expect.objectContaining({
        colorBackground: "#ffffff",
        colorForeground: "#111827",
        colorBorder: "#d1d5db",
        radius: 6,
      }),
    );
    expect(Object.keys(defaultTheme)).toEqual(["name", "tokens"]);
  });
});
