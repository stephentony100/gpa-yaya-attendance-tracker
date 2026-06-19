import type { Config } from "tailwindcss";
const yaTokens: Config["theme"] = require("../../docs/tailwind.tokens.js");

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      ...yaTokens,
      keyframes: {
        "halo-in": {
          from: { opacity: "0", transform: "scale(0.85)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "halo-in": "halo-in 300ms ease",
      },
    },
  },
  plugins: [],
};
export default config;
