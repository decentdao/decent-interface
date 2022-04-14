module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        md: '3rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
    },
    fontFamily: {
      sans: ['IBM Plex Sans'],
      mono: ['IBM Plex Mono'],
    },
    letterSpacing: {
      logo: '.25em',
    },
    extend: {   
       colors: {
      'header-black': '#1b1a1a',
      'header-gold': '#fabd2e',
       } 
    }
  },
  plugins: [],
}
