/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sandwatch': {
          '50': '#e8ffe5',
          '100': '#cbffc6',
          '200': '#9aff94',
          '300': '#58ff55',
          '400': '#3bf93b',
          '500': '#03df07',
          '600': '#00b207',
          '700': '#04870a',
          '800': '#0a6a10',
          '900': '#0e5914',
          '950': '#013206',
        },
      },    
    },
  },
  plugins: [],
}

