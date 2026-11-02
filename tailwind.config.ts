import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#000",
        coal: "#14151a",
        gold: "#fcc419",
        steel: "#a5a9b0",
        mist: "#f1f2f4",
      },
      fontFamily: {
        display: ["var(--font-archivo)", "sans-serif"],
        sans: ["var(--font-source-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
