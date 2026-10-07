/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
          from: '#6366F1',
          to: '#8B5CF6',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        cyan: {
          glow: '#22D3EE',
        },
        thread: {
          t1: '#6366F1', // indigo
          t2: '#EC4899', // pink
          t3: '#10B981', // emerald
          t4: '#F59E0B', // amber
          t5: '#06B6D4', // cyan
          t6: '#8B5CF6', // purple
          t7: '#F97316', // orange
          t8: '#14B8A6', // teal
        },
        state: {
          new: '#64748B',        // slate
          ready: '#F59E0B',      // amber
          running: '#10B981',    // emerald
          waiting: '#0284C7',    // sky/blue
          terminated: '#EF4444', // rose/red
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', '"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { filter: 'drop-shadow(0 0 4px rgba(99, 102, 241, 0.4))' },
          '100%': { filter: 'drop-shadow(0 0 16px rgba(139, 92, 246, 0.8))' },
        }
      }
    },
  },
  plugins: [],
}
