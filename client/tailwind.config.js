/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette
        primary: {
          DEFAULT: '#E85D26', // Burnt orange
          light:   '#FF7A47',
          dark:    '#C04410',
        },
        secondary: {
          DEFAULT: '#2D6A4F', // Forest green
          light:   '#40916C',
          dark:    '#1E4D38',
        },
        accent: {
          DEFAULT: '#F4A261', // Warm amber
          light:   '#FFD6A5',
        },
        // Backgrounds
        background: '#FFFBF7',  // Main app warm off-white
        warmbg:     '#FFFBF7',  // Legacy alias
        surface:    '#FFFFFF',
        surfaceAlt: '#FFF3E8',
        // Borders & text
        warmborder:    '#E8DDD3',
        textPrimary:   '#1A1208',
        textSecondary: '#6B5744',
        textMuted:     '#9C8577',
        // Utility
        error:   '#D90429',
        success: '#2D6A4F',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        serif:   ['Playfair Display', 'Georgia', 'serif'],
        body:    ['Plus Jakarta Sans', 'sans-serif'],
        sans:    ['Plus Jakarta Sans', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      boxShadow: {
        sm:      '0 1px 2px rgba(26, 18, 8, 0.05)',
        md:      '0 4px 6px -1px rgba(26, 18, 8, 0.10)',
        lg:      '0 10px 15px -3px rgba(26, 18, 8, 0.10)',
        premium: '0 4px 20px rgba(26, 18, 8, 0.06)',
        lifted:  '0 10px 30px rgba(26, 18, 8, 0.12)',
      },
      borderRadius: {
        card: '20px',
        pill: '9999px',
      },
      animation: {
        'in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',   opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
