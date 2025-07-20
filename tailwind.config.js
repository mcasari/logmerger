/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        'primary': '#2563eb', // blue-600
        'primary-50': '#eff6ff', // blue-50
        'primary-100': '#dbeafe', // blue-100
        'primary-500': '#3b82f6', // blue-500
        'primary-600': '#2563eb', // blue-600
        'primary-700': '#1d4ed8', // blue-700
        'primary-foreground': '#ffffff', // white

        // Secondary Colors
        'secondary': '#64748b', // slate-500
        'secondary-50': '#f8fafc', // slate-50
        'secondary-100': '#f1f5f9', // slate-100
        'secondary-200': '#e2e8f0', // slate-200
        'secondary-300': '#cbd5e1', // slate-300
        'secondary-400': '#94a3b8', // slate-400
        'secondary-500': '#64748b', // slate-500
        'secondary-600': '#475569', // slate-600
        'secondary-700': '#334155', // slate-700
        'secondary-foreground': '#ffffff', // white

        // Accent Colors
        'accent': '#0891b2', // cyan-600
        'accent-50': '#ecfeff', // cyan-50
        'accent-100': '#cffafe', // cyan-100
        'accent-500': '#06b6d4', // cyan-500
        'accent-600': '#0891b2', // cyan-600
        'accent-700': '#0e7490', // cyan-700
        'accent-foreground': '#ffffff', // white

        // Background Colors
        'background': '#ffffff', // white
        'surface': '#f8fafc', // slate-50
        'surface-hover': '#f1f5f9', // slate-100

        // Text Colors
        'text-primary': '#0f172a', // slate-900
        'text-secondary': '#475569', // slate-600
        'text-muted': '#64748b', // slate-500

        // Status Colors
        'success': '#059669', // emerald-600
        'success-50': '#ecfdf5', // emerald-50
        'success-100': '#d1fae5', // emerald-100
        'success-500': '#10b981', // emerald-500
        'success-600': '#059669', // emerald-600
        'success-foreground': '#ffffff', // white

        'warning': '#d97706', // amber-600
        'warning-50': '#fffbeb', // amber-50
        'warning-100': '#fef3c7', // amber-100
        'warning-500': '#f59e0b', // amber-500
        'warning-600': '#d97706', // amber-600
        'warning-foreground': '#ffffff', // white

        'error': '#dc2626', // red-600
        'error-50': '#fef2f2', // red-50
        'error-100': '#fee2e2', // red-100
        'error-500': '#ef4444', // red-500
        'error-600': '#dc2626', // red-600
        'error-foreground': '#ffffff', // white

        // Border Colors
        'border': '#e5e7eb', // gray-200
        'border-strong': '#d1d5db', // gray-300
        'border-muted': '#f3f4f6', // gray-100
      },
      fontFamily: {
        'heading': ['Inter', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
        'caption': ['Inter', 'system-ui', 'sans-serif'],
        'data': ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      fontWeight: {
        'normal': '400',
        'medium': '500',
        'semibold': '600',
      },
      boxShadow: {
        'sm': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'hover': '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'sm': '4px',
        'DEFAULT': '6px',
        'md': '6px',
        'lg': '8px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      transitionDuration: {
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
      },
      transitionTimingFunction: {
        'ease-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      animation: {
        'shimmer': 'shimmer 1.5s infinite',
        'tooltip': 'tooltip-appear 150ms ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'tooltip-appear': {
          'from': {
            opacity: '0',
            transform: 'translateY(4px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      zIndex: {
        '100': '100',
        '200': '200',
        '300': '300',
        '1000': '1000',
      },
    },
  },
  plugins: [],
}