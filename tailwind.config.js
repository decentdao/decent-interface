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
        'gray': {
          '25': '#f5f5f5',
          '50': '#b6b3ac',
          '100': '#606060',
          '200': '#484848',
          '300': '#393939',
          '400': '#2c2c2c',
          '500': '#212121',
          '600': '#1b1a1a',
          '700': '#161616',
        },
        'chocolate': {
          '400': '#272520',
          '500': '#36342f',
        },
        'red': '#ff7373',
        'gold': {
          '300': '#ffd26a',
          '500': '#fabd2e',
          '600': '#af8420',
        },
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
      },
      backgroundImage: {
        'image-pattern': "url('./assets/images/bg-glow-top-left.png'), linear-gradient(to bottom, #272520, #1b1a18)",
      }
    }
  },
  plugins: [],
}