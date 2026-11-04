import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const config = [
  ...nextVitals,
  ...nextTs,
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', 'playwright-report/**', 'test-results/**'],
  },
  {
    rules: {
      // Las imágenes del catálogo vienen de hosts externos (Vercel Blob, Unsplash): se usan <img> simples.
      '@next/next/no-img-element': 'off',
    },
  },
]

export default config
