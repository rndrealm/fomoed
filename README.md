# Fomoed Monorepo

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `fomoed`: Existing dashboard at https://fomoed.io
- `dashboard`: The new version of the dashboard being developed in React
- `livesocket`: A proxy used with the cignals chart, deployed on Digital Ocean
---
- `@repo/ui`: a stub React component library shared by both `web` and `docs` applications
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

### Build

To build all apps and packages, run the following command:

```
cd my-turborepo
pnpm build
```

### Develop

To develop all apps and packages, run the following command:

```
pnpm dev
```
