import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class", ".dark"],
	content: [
		"./src/app/**/*.{ts,tsx}",
		"./src/components/**/*.{ts,tsx}",
		"./src/lib/**/*.{ts,tsx}",
		"./src/store/**/*.{ts,tsx}"
	],
	theme: {
		extend: {
			colors: {
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))"
			}
		}
	},
	plugins: []
};

export default config;
