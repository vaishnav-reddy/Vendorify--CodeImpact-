/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
    theme: {
      extend: {
        colors: {
          lime: '#CDF546',
          beige: '#FDF9DC',
          orange: '#F56013',
          teal: '#1A6950',
          'deep-green': '#01583F',
          primary: {
            DEFAULT: '#1A6950',
            light: '#CDF546',
            dark: '#01583F',
          },
          secondary: {
            DEFAULT: '#F56013',
            light: '#FDF9DC',
            dark: '#F56013',
          },
        },
        fontFamily: {
          sans: ['Archivo', 'ui-sans-serif', 'system-ui'],
          archivo: ['Archivo', 'sans-serif'],
          helvetica: ['"Helvetica Neue"', 'sans-serif'],
          deviantly: ['"Deviantly Brush"', 'cursive'],
        },
        boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      },
      maxWidth: {
        'mobile': '428px',
        'tablet': '768px',
        'desktop': '1200px',
      },
    },
  },
  plugins: [],
}
