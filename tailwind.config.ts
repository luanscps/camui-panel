import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0fafb',
          100: '#d9f1f4',
          200: '#b3e3e9',
          300: '#7dcdd6',
          400: '#42aeba',
          500: '#2793a0',
          600: '#01696f',
          700: '#0c4e54',
          800: '#0f3638',
          900: '#112f31',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
