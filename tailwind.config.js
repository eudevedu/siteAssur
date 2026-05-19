/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        patriotic: {
          green: {
            DEFAULT: 'var(--color-primary, #006738)',
            light: 'var(--color-primary-light, #00854a)',
            dark: 'var(--color-primary-dark, #004a28)',
          },
          yellow: {
            DEFAULT: 'var(--color-secondary, #FFD100)',
            light: 'var(--color-secondary-light, #ffdd33)',
            dark: 'var(--color-secondary-dark, #ccaa00)',
          },
          blue: {
            DEFAULT: 'var(--color-accent, #0038A8)',
            light: 'var(--color-accent-light, #004cd4)',
            dark: 'var(--color-accent-dark, #002670)',
          }
        },
        admin: {
          primary: '#1e293b',
          secondary: '#334155',
          accent: '#3b82f6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      backgroundImage: {
        'glass': 'linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
      }
    },
  },
  plugins: [],
}
