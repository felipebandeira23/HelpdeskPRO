/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Tokens legados (mantidos para compatibilidade)
        primary: '#2b73c9',
        success: '#2db87d',
        danger: '#e85d2d',
        // Design system v2 (design-system/MASTER.md)
        brand: {
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        surface: {
          base: '#0b1220',
          raised: '#0f172a',
        },
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(0 0 0 / 0.3), 0 1px 8px -2px rgb(0 0 0 / 0.25)',
        pop: '0 8px 30px -6px rgb(0 0 0 / 0.55), 0 2px 8px -2px rgb(0 0 0 / 0.4)',
        'glow-brand': '0 0 0 1px rgb(59 130 246 / 0.25), 0 4px 20px -4px rgb(59 130 246 / 0.35)',
      },
      borderColor: {
        line: 'rgb(255 255 255 / 0.06)',
        'line-strong': 'rgb(255 255 255 / 0.12)',
      },
      animation: {
        shimmer: 'shimmer 1.6s linear infinite',
        'fade-up': 'fadeUp 200ms ease-out both',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
