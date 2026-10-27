/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './App.tsx', './components/**/*.{ts,tsx}', './hooks/**/*.{ts,tsx}'],
  corePlugins: { preflight: false },
  theme: { extend: {} },
  plugins: [],
};
