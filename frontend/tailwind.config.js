module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'sans-serif'], // Set Nunito as the primary sans-serif font
      },
      backgroundImage: {
        'custom-gradient': 'linear-gradient(180deg, rgba(1,7,37,1) 0%, rgba(39,51,109,1) 100%)',
      },
    },
  },
  plugins: [],
};