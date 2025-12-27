import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-nunito)', 'sans-serif'],
      },
      colors: {
        rejimde: {
          green: '#58cc02', 
          greenDark: '#46a302',
          blue: '#1cb0f6',
          blueDark: '#1899d6',
          yellow: '#ffc800',
          yellowDark: '#e5a500',
          red: '#ff4b4b',
          redDark: '#d42828',
          purple: '#ce82ff',
          purpleDark: '#a348e0',
          teal: '#14b8a6',
          tealDark: '#0d9488',
          text: '#4b4b4b',
          bg: '#f7f7f7'
        }
      },
      boxShadow: {
        'btn': '0 4px 0 0',
        'card': '0 4px 0 0 rgba(0,0,0,0.1)',
        'float': '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
      },
      animation: {
        'bounce-slow': 'bounce-slow 3s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;