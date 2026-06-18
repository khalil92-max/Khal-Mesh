import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        sidebar: "var(--sidebar)",
        hover: "var(--hover)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        muted: "var(--muted)",
        faint: "var(--faint)",
        line: "var(--border)",
        "line-strong": "var(--border-strong)",
        accent: "rgb(var(--accent-rgb) / <alpha-value>)",
        btn: "var(--btn)",
        "btn-hover": "var(--btn-hover)",
        danger: "var(--danger)",
        "danger-strong": "var(--danger-strong)",
        today: "var(--today)",
        link: "var(--link)",
        "tag-fg": "var(--tag-fg)",
        "note-bg": "var(--note-bg)",
        "note-dot": "var(--note-dot)",
        "link-bg": "var(--link-bg)",
        "link-dot": "var(--link-dot)",
        "project-bg": "var(--project-bg)",
        "project-dot": "var(--project-dot)",
        "task-bg": "var(--task-bg)",
        "task-dot": "var(--task-dot)",
        "p1-dot": "var(--p1-dot)",
        "p2-dot": "var(--p2-dot)",
        "purple-bg": "var(--purple-bg)",
        "purple-line": "var(--purple-line)",
      },
      borderColor: {
        DEFAULT: "var(--border)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        card: "0.625rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,15,15,0.04), 0 0 0 1px rgba(15,15,15,0.04)",
        cardhover: "0 2px 6px rgba(15,15,15,0.06), 0 0 0 1px rgba(15,15,15,0.08)",
        soft: "0 1px 2px rgba(15,15,15,0.06), 0 0 0 1px rgba(15,15,15,0.06)",
      },
      maxWidth: {
        content: "44rem",
      },
    },
  },
  plugins: [],
};

export default config;
