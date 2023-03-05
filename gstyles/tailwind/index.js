module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./containers/**/*.{js,ts,jsx,tsx}",
    "./gstyles/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: require("../styleguide/colors"),
      fontSize: require("../styleguide/fontSize"),
      borderRadius: require("../styleguide/borderRadius"),
      keyframes: {
        dropdown: {
          "0%": {
            transform: "scaleY(0.5)",
            opacity: 0,
            transformOrigin: "top left",
          },
          "100%": {
            transform: "scaleY(1)",
            opacity: 1,
            transformOrigin: "top left",
          },
        },
      },
      animation: {
        dropdown: "dropdown .3s ease-in",
      },
      height: {
        ["4.5"]: "1.125rem",
      },
      width: {
        ["4.5"]: "1.125rem",
      },
    },
    screens: {
      sm: "640px",
      // => @media (min-width: 640px) { ... }
      md: "768px",
      // => @media (min-width: 768px) { ... }
      lg: "1024px",
      // => @media (min-width: 1024px) { ... }
      xl: "1280px",
      // => @media (min-width: 1280px) { ... }
      "2xl": "1536px",
      // => @media (min-width: 1536px) { ... }
      fhd: "1920px",
      // => @media (min-width: 1920px) { ... }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require("tailwindcss"), require("autoprefixer")],
};
