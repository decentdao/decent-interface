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
        'black': {
          '100': '#484848',
          '300': '#212121',
          '500': '#2c2c2c',
          '900': '#1b1a1a',
        },
        'chocolate': '#272520',
        'gold': {
          '300': '#ffd26a',
          '500': '#fabd2e'
        },
        'mediumGray': '#b6b3ac',
      },
      letterSpacing: {
        widest: '.25em',
      },
      backgroundImage: {
        'image-pattern': "url('./assets/images/bg-glow-top-left.png'), linear-gradient(to bottom, #272520, #1b1a18)",
      }
    }
  },
  plugins: [],
}
