/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,ts,tsx}', './src/**/*.{js,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#FF7A00',
        'primary-light': '#FFE0B2',
        'primary-dark': '#E56900',
        secondary: '#FFE0B2',
        background: '#F8F9FB',
        card: '#FFFFFF',
        'text-dark': '#1E1E1E',
        'text-gray': '#6B7280',
        'text-light': '#9CA3AF',
        success: '#4CAF50',
        purple: '#8B5CF6',
        'purple-light': '#EDE9FE',
        danger: '#EF4444',
        warning: '#F59E0B',
        border: '#E5E7EB',
      },
      fontFamily: {
        'poppins': ['Poppins_400Regular'],
        'poppins-medium': ['Poppins_500Medium'],
        'poppins-semibold': ['Poppins_600SemiBold'],
        'poppins-bold': ['Poppins_700Bold'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
    },
  },
  plugins: [],
};
