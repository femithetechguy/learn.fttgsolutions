/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#080808',
          secondary: '#111111',
          card: '#161616',
          elevated: '#1e1e1e',
        },
        gold: {
          DEFAULT: '#D4AF37',
          light: '#E8CC6A',
          dark: '#A8891E',
          muted: '#D4AF3720',
          border: '#D4AF3740',
        },
        text: {
          primary: '#F0EDE6',
          secondary: '#A0998E',
          muted: '#5A5550',
        },
        accent: {
          bi: '#1D9E75',
          dev: '#378ADD',
          phil: '#EF9F27',
          cross: '#7F77DD',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Source Sans Pro', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #A8891E 100%)',
        'dark-gradient': 'linear-gradient(180deg, #111111 0%, #080808 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease forwards',
        'slide-up': 'slideUp 0.5s ease forwards',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px #D4AF3720' },
          '50%': { boxShadow: '0 0 40px #D4AF3740' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'gold': '0 0 30px #D4AF3725, 0 1px 0 #D4AF3740 inset',
        'card': '0 1px 0 #ffffff08, 0 4px 24px #00000060',
        'glow-sm': '0 0 12px #D4AF3730',
      },
    },
  },
  plugins: [],
}
