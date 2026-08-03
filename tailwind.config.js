/** Vanderbilt / FLH brand tokens per design spec */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'vu-black': '#1C1C1C',
        'vu-white': '#FFFFFF',
        'vu-gold': '#CFAE70',
        'vu-gold-light': '#FEEEB6',
        'vu-gold-dark': '#B49248',
        'vu-cream': '#F5F3EF',
        'vu-sand': '#E0D5C0',
        'vu-gray-light': '#E4E4E4',
        'vu-gray-dark': '#777777',
        'vu-highlight': '#ECB748',
        'vu-oak': '#946E24',
        'vu-sky': '#B3C9CD',
        'vu-sage': '#8BA18E',
      },
      fontFamily: {
        serif: ['"Libre Caslon Display"', '"Libre Caslon Text"', '"Times New Roman"', 'serif'],
        sans: ['Inter', 'Arial', 'sans-serif'],
        condensed: ['Antonio', 'Impact', 'sans-serif'],
      },
      backgroundImage: {
        'vu-gold-gradient': 'linear-gradient(135deg, #FEEEB6 0%, #CFAE70 45%, #B49248 100%)',
      },
      borderRadius: {
        vu: '4px',
      },
    },
  },
  plugins: [],
};
