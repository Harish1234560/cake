import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './store/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#fffdf8',
        'bg-deep': '#1f3025',
        surface: {
          1: '#f7efe3',
          2: '#fff8ee',
          3: '#f3e3d1',
          glass: 'rgba(255, 253, 248, 0.84)',
        },
        foreground: '#203326',
        accent: {
          DEFAULT: '#f04425',
          bright: '#ff613d',
          deep: '#c9321a',
        },
        rose: '#e9574d',
        cream: '#fff8ec',
        border: 'rgba(32, 51, 38, 0.14)',
        'border-strong': 'rgba(240, 68, 37, 0.42)',
        muted: 'rgba(32, 51, 38, 0.70)',
        faint: 'rgba(32, 51, 38, 0.46)',
        success: '#5a9c6a',
        warning: '#c8a55a',
        error: '#c8645a',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
      },
      fontSize: {
        caption: ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.32em' }],
        'h1-fluid': ['clamp(3rem,11vw,7.5rem)', { lineHeight: '1.02', letterSpacing: '-0.01em' }],
        'h2-fluid': ['clamp(2.4rem,7vw,5rem)', { lineHeight: '1.02', letterSpacing: '-0.01em' }],
      },
      letterSpacing: {
        caption: '0.32em',
        button: '0.2em',
      },
      borderRadius: {
        card: '28px',
        pill: '9999px',
      },
      spacing: {
        'header-mobile': '64px',
        'header-desktop': '76px',
      },
      maxWidth: {
        content: '1280px',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #e95a28 0%, #ff8a45 42%, #f04425 68%, #ffb05f 100%)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up': { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'pulse-soft': { '0%,100%': { opacity: '0.4' }, '50%': { opacity: '0.8' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        'conic-spin': { to: { transform: 'rotate(360deg)' } },
      },
      animation: {
        'fade-in': 'fade-in 0.8s ease forwards',
        'slide-up': 'slide-up 0.8s ease forwards',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        shimmer: 'shimmer 4s linear infinite',
        'conic-spin': 'conic-spin 4s linear infinite',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
