/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background colors
        'bg-primary': '#0f1117',
        'bg-secondary': '#1a1f2e',
        'bg-tertiary': '#2d3748',

        // Accent colors
        'accent-primary': '#6ee7b7',
        'accent-hover': '#a7f3d0',
        'accent-secondary': '#a78bfa',

        // Text colors
        'text-primary': '#ffffff',
        'text-secondary': '#94a3b8',
        'text-tertiary': '#4a5568',

        // Status colors
        'success': '#6ee7b7',
        'warning': '#fbbf24',
        'error': '#f87171',
        'info': '#60a5fa',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', '"SF Mono"', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
