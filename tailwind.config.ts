import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0F1115",
        surface: "#181B20",
        surfaceHover: "#22262E",
        surfaceBorder: "#262A33",
        brand: {
          DEFAULT: "#F59E0B",
          hover: "#D97706",
          dark: "#0F1115",
        },
        status: {
          available: "#10B981", // Emerald
          occupied: "#F59E0B",  // Amber
          bill: "#F43F5E",      // Rose
          cleaning: "#0EA5E9",  // Sky
          void: "#EF4444",      // Red
        },
      },
      minHeight: {
        touch: "48px",
      },
      minWidth: {
        touch: "48px",
      },
    },
  },
  plugins: [],
};

export default config;
