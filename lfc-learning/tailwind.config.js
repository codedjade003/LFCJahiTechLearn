/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');
 module.exports = {
      darkMode: 'class', // Enable dark mode with class strategy
      content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}"
      ],
      theme: {
        extend: {
          colors: {
            redCustom: "#A41E21", // Primary
            goldCustom: "#D4AF37", // Secondary
            lfc: {
              red: "#A41E21", // Primary
              gold: "#D4AF37", // Secondary
              gray: "#4B5563", // Neutral text
            },
          },
        },
      },
      plugins: [require("tailwind-scrollbar-hide")],
 }; 


