/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // parse all html files in public directory
    './public/*.html',
    // parse all js files in this directory and subdirectories
    './**/js/**/*.js',
    // parse all ejs files in views directory and subdirectories
    './views/**/*.ejs'
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        'primary-dark': 'var(--primary-dark)',
        'primary-light': 'var(--primary-light)',
        'secondary': 'var(--secondary)',
        
        dark: 'var(--dark)',
        light: 'var(--light)',
      }
    },
  },
  plugins: [],
}
