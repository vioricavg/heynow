import { type Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    extend: {
      animation: {
        'spin': 'spin 1s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config

export default config