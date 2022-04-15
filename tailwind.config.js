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
    extend: {
      colors: {
        'black': '#1b1a1a',
        'lighterBlack': '#212121',
        'medBlack': '#2c2c2c',
        'lightBlack': '#484848',
        'gold': '#fabd2e',
        'mediumGray': '#b6b3ac',
      },
      letterSpacing: {
        widest: '.25em',
      }
    }
  },
  plugins: [],
}
