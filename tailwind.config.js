/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          soft: 'var(--color-primary-soft)',
          focus: 'var(--color-focus-ring)',
        },
        background: 'var(--color-background)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          hover: 'var(--color-surface-hover)',
        },
        text: {
          DEFAULT: 'var(--color-text)',
          muted: 'var(--color-text-muted)',
          light: 'var(--color-text-light)',
          subtle: 'var(--color-text-subtle)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          dark: 'var(--color-border-dark)',
        },
        'focus-ring': 'var(--color-focus-ring)',
        status: {
          success: {
            DEFAULT: 'var(--color-success)',
            dark: 'var(--color-success-dark)',
            soft: 'var(--color-success-soft)',
            light: 'var(--color-success-light)',
            border: 'var(--color-success-border)',
          },
          warning: {
            DEFAULT: 'var(--color-warning)',
            dark: 'var(--color-warning-dark)',
            soft: 'var(--color-warning-soft)',
            light: 'var(--color-warning-light)',
            border: 'var(--color-warning-border)',
          },
          danger: {
            DEFAULT: 'var(--color-danger)',
            dark: 'var(--color-danger-dark)',
            soft: 'var(--color-danger-soft)',
            light: 'var(--color-danger-light)',
            border: 'var(--color-danger-border)',
          },
          info: {
            DEFAULT: 'var(--color-info)',
            dark: 'var(--color-info-dark)',
            soft: 'var(--color-info-soft)',
            light: 'var(--color-info-light)',
            border: 'var(--color-info-border)',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.4s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
