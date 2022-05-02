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
        'drab': {
          500: '#746338'
        },
        'sand': {
          500: '#FFDA85',
        }
      },
      letterSpacing: {
        widest: '.25em',
      },
      fontSize: {
        'xxs': '0.625rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '4rem',
        '7xl': '5rem',
      },
      maxWidth: {
        'xxs': '18.5rem'
      },
      minWidth: {
        'xxs': '18.5rem'
      },
      backgroundImage: {
        'image-pattern': "url('./assets/images/bg-glow-top-left.png'), linear-gradient(to bottom, #272520, #1b1a18)",
      },
      boxShadow: {
        menu: '0px 8px 48px rgba(0, 0, 0, 0.5), 0px 0px 1px rgba(0, 0, 0, 0.25)'
      }
    }
  },
  plugins: [],
}