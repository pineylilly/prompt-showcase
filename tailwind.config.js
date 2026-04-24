/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: 'var(--color-bg-main)',
          surface: 'var(--color-bg-surface)',
          text: 'var(--color-text-main)',
          muted: 'var(--color-text-muted)',
          border: 'var(--color-border)',
          accent: 'var(--color-accent)',
        }
      },
    },
  },
  plugins: [],
}
