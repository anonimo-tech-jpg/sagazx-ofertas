import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: { colors: {
    bg: "#07050d", card: "#100c1b", line: "#241a3a",
    brand: { DEFAULT: "#8b5cf6", dark: "#6d28d9", light: "#a78bfa" },
  }}},
  plugins: [],
};
export default config;
