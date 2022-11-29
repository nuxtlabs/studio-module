// @ts-ignore
import defaultTheme from 'tailwindcss/defaultTheme'

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    'ui.preset.ts',
    'content/**/*.md'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#d9e5ff',
          100: '#b3cbff',
          200: '#8db0ff',
          300: '#6696ff',
          400: '#407cff',
          500: '#1a62ff',
          600: '#0047e1',
          700: '#0035a9',
          800: '#002370',
          900: '#001238'
        }
      },
      animation: {
        gradient: 'gradient 15s ease infinite'
      },
      keyframes: {
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        }
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem'
      },
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans]
      }
    }
  }
}
