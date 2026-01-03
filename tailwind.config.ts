import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Teal (Yoga/Pilates)
    'bg-teal-50', 'bg-teal-100', 'bg-teal-500', 'bg-teal-600',
    'border-teal-400', 'border-teal-600', 'border-teal-700',
    'text-teal-500', 'text-teal-600', 'text-teal-700', 'text-teal-200',
    'hover:bg-teal-600', 'hover:bg-teal-50',
    'shadow-teal-200',
    // Green (Beslenme)
    'bg-green-50', 'bg-green-100', 'bg-green-500', 'bg-green-600',
    'border-green-400', 'border-green-600',
    'text-green-500', 'text-green-600', 'text-green-700', 'text-green-200',
    'hover:bg-green-600', 'hover:bg-green-50',
    // Blue (Fitness)
    'bg-blue-50', 'bg-blue-100', 'bg-blue-500', 'bg-blue-600',
    'border-blue-400', 'border-blue-600',
    'text-blue-500', 'text-blue-600', 'text-blue-700', 'text-blue-200',
    'hover:bg-blue-600', 'hover:bg-blue-50',
    // Purple (Mental)
    'bg-purple-50', 'bg-purple-100', 'bg-purple-500', 'bg-purple-600',
    'border-purple-400', 'border-purple-600',
    'text-purple-500', 'text-purple-600', 'text-purple-700', 'text-purple-200',
    'hover:bg-purple-600', 'hover:bg-purple-50',
    // Red (Health)
    'bg-red-50', 'bg-red-100', 'bg-red-500', 'bg-red-600',
    'border-red-400', 'border-red-600',
    'text-red-500', 'text-red-600', 'text-red-700', 'text-red-200',
    'hover:bg-red-600', 'hover:bg-red-50',
    // Orange (Combat)
    'bg-orange-50', 'bg-orange-100', 'bg-orange-500', 'bg-orange-600',
    'border-orange-400', 'border-orange-600',
    'text-orange-500', 'text-orange-600', 'text-orange-700', 'text-orange-200',
    'hover:bg-orange-600', 'hover:bg-orange-50',
    // Indigo (Default)
    'bg-indigo-50', 'bg-indigo-100', 'bg-indigo-500', 'bg-indigo-600', 'bg-indigo-700',
    'border-indigo-400', 'border-indigo-600', 'border-indigo-700',
    'text-indigo-500', 'text-indigo-600', 'text-indigo-700', 'text-indigo-200',
    'hover:bg-indigo-600', 'hover:bg-indigo-50',
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