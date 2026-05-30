import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#faf8f5",
        foreground: "#1a1a1a",
        card: {
          DEFAULT: "#ffffff",
          foreground: "#1a1a1a",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#1a1a1a",
        },
        primary: {
          DEFAULT: "#1a1a1a",
          foreground: "#faf8f5",
        },
        secondary: {
          DEFAULT: "#ede9e3",
          foreground: "#1a1a1a",
        },
        muted: {
          DEFAULT: "#d4ccc0",
          foreground: "#5a5a5a",
        },
        accent: {
          DEFAULT: "#8b4513",
          foreground: "#faf8f5",
        },
        destructive: {
          DEFAULT: "#dc2626",
          foreground: "#ffffff",
        },
        border: "#e5ddd0",
        input: "#ffffff",
        ring: "#1a1a1a",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
