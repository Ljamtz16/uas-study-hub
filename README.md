# UAS Study Hub

Vertical Slice 01 de V0.1: una PWA local-first para estudiar el Golden Topic de Radioenlaces, registrar evidencia de estudio, calcular mastery de forma determinista y conservar progreso y notas en IndexedDB.

## Desarrollo

Requiere Node.js 20 o posterior y npm/pnpm.

```bash
npm install
npm run dev
```

## Verificación

```bash
npm run lint
npm run typecheck
npm test
npm run build
npx playwright test
```

La primera ejecución de Playwright puede requerir `npx playwright install chromium`.
