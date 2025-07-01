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

## Environment

### Redis DB

A redis DB is used for caching data of the coinstats widget and may be used also for other widgets in the future.

The redis DB is set up on the VPS `api.fomoed.io` on port `6379`.
Connection is made from the Next.js edge function. Connection is secured over TLS. DB is secured with a password.

⚠️ This is fine for just the widget data. We absolutely CANNOT store any user data or sensitive info in this instance, as it is not safe.

The same instance is used for all deploys.

### Troubleshooting

**API edge function are not connecting to redis DB**

1. Check if TLS certificates are expired on the VPS.