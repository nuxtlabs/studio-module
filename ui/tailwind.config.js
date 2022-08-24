/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    'ui/*.ts',
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
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem'
      }
    }
  }
}
