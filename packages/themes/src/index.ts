export interface ThemeTokenMap {
  colorBackground?: string;
  colorForeground?: string;
  colorBorder?: string;
  colorDanger?: string;
  colorMuted?: string;
  radius?: string | number;
  spacing?: string | number;
  fontFamily?: string;
}

export interface FormTheme {
  name: string;
  tokens: ThemeTokenMap;
  classNames?: Record<string, string>;
  metadata?: Record<string, unknown>;
}

export const defaultTheme: FormTheme = {
  name: "default",
  tokens: {
    colorBackground: "#ffffff",
    colorForeground: "#111827",
    colorBorder: "#d1d5db",
    colorDanger: "#dc2626",
    colorMuted: "#6b7280",
    radius: 6,
    spacing: 8,
    fontFamily: "system-ui, sans-serif",
  },
};

export const minimalTheme: FormTheme = {
  name: "minimal",
  tokens: {
    colorBackground: "#ffffff",
    colorForeground: "#111111",
    colorBorder: "#cccccc",
    colorDanger: "#b00020",
    colorMuted: "#666666",
    radius: 4,
    spacing: 8,
    fontFamily: "system-ui, sans-serif",
  },
};

export const shadcnTheme: FormTheme = {
  name: "shadcn",
  tokens: defaultTheme.tokens,
};

export const muiTheme: FormTheme = {
  name: "mui",
  tokens: defaultTheme.tokens,
};

export const bootstrapTheme: FormTheme = {
  name: "bootstrap",
  tokens: defaultTheme.tokens,
};

export const tailwindTheme: FormTheme = {
  name: "tailwind",
  tokens: defaultTheme.tokens,
};

