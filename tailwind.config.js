/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-to-r": "linear-gradient(to right, var(--tw-gradient-stops))",
        "gradient-to-b": "linear-gradient(to bottom, var(--tw-gradient-stops))",
        // Add more gradient directions as needed
      },
      gradientColorStops: (theme) => ({
        primary: "#FF5733",
        secondary: "#FFC300",
        // Add more colors as needed
      }),
    },
  },
  plugins: [],
};
