import type { Config } from "tailwindcss";

// Brand palette: Alyson yellow on near-black, with neutral greys for text and borders.
// `line` is the yellow accent (kept under that name across the codebase), `sky` is the
// blue used only inside the admin panel for links and focus rings.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        asphalt: "#111215",
        ink: "#0B0C0F",
        coal: "#1A1C21",
        road: "#4B5160",
        rail: "#E4E7EC",
        mist: "#F5F6F8",
        line: "#FFBB00",
        brand: { DEFAULT: "#FFBB00", hover: "#E8AA00", soft: "#FFF4D1", deep: "#8A6400" },
        sky: "#1F5FAD",
      },
      fontFamily: {
        sans: ["var(--font-display)", "system-ui", "-apple-system", '"Segoe UI"', "Roboto", "Arial", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.04)",
        lift: "0 20px 50px -24px rgba(17,18,21,0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
