export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    'text-red-600',
    'text-9xl',
  ],
  theme: {
    extend: {
      colors: {
        'primary-color': '#0d0c0b',
        'secondary-color': '#141312',
        'tertiary-color': '#1b1a19',
        'quaternary-color': '#3D3C3BFF',
        'accent-color': '#2666CF',
        'accent-color-light': '#3F8AE0',
        'accent-color-lighter': '#599EEF',
        'accent-color-dark': '#1A4E9E',
        'accent-color-darker': '#133E7D',
        'accent-color-darkest': '#0D2E5C',
      },
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
  important: true,
};