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
        'chocolate': '#272520',
        'medBlack': '#2c2c2c',
        'lightBlack': '#484848',
        'gold': '#fabd2e',
        'lightGold': '#ffd26a',
        'mediumGray': '#b6b3ac',
        'lightGray': '#f5f5f5',
      },
      letterSpacing: {
        widest: '.25em',
      },
      fontSize: {
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '4rem',
        '7xl': '5rem',
      }
    }
  },
  plugins: [],
}
