import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    // Orange color palette
    orange: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316', // Main orange color
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
    },
    // Black color palette
    black: {
      50: '#f7f7f7',
      100: '#e3e3e3',
      200: '#c8c8c8',
      300: '#a4a4a4',
      400: '#818181',
      500: '#666666',
      600: '#515151',
      700: '#434343',
      800: '#383838',
      900: '#000000', // Pure black
    },
    // Black-green color palette
    blackGreen: {
      50: '#f0f9f0',
      100: '#dcf2dc',
      200: '#bce5bc',
      300: '#8dd18d',
      400: '#5bb85b',
      500: '#3a9d3a',
      600: '#2d7d2d',
      700: '#256325',
      800: '#1f4f1f',
      900: '#0d1f0d', // Very dark green (black-green)
    },
    // Legacy brand colors (now using orange)
    brand: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316', // Main brand color (orange)
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
    },
    // Updated gray palette
    secondaryGray: {
      100: '#f7f7f7',
      200: '#e3e3e3',
      300: '#c8c8c8',
      400: '#a4a4a4',
      500: '#818181',
      600: '#666666',
      700: '#515151',
      800: '#383838',
      900: '#000000',
    },
  },
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif',
  },
  space: {
    px: '1px',
    0: '0',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem',
  },
  styles: {
    global: {
      body: {
        bg: 'white',
        color: 'black.900',
      },
    },
  },
  components: {
    Button: {
      variants: {
        brand: {
          bg: 'orange.500',
          color: 'white',
          _hover: {
            bg: 'orange.600',
          },
        },
        orange: {
          bg: 'orange.500',
          color: 'white',
          _hover: {
            bg: 'orange.600',
          },
        },
        blackGreen: {
          bg: 'blackGreen.800',
          color: 'white',
          _hover: {
            bg: 'blackGreen.900',
          },
        },
      },
    },
    Card: {
      variants: {
        horizon: {
          container: {
            bg: 'white',
            borderRadius: 'xl',
            boxShadow: '0px 3.5px 5.5px rgba(0, 0, 0, 0.02)',
            border: '1px solid',
            borderColor: 'secondaryGray.200',
          },
        },
      },
    },
  },
});

export default theme;
