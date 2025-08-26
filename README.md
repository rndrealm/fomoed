# Fomoed Monorepo

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

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

## Manual Dev Env CRON job triggers

Because of rate limits on the various APIs, CRON jobs, which are enabled
in production need to be triggered manually in the dev env. Use the following URLs to trigger CRON jobs in the dev env.

| Name        | URL                                             |
| ----------- | ----------------------------------------------- |
| Scrape news | https://dashboard-dev.fomoed.io/api/news        |
| Scrape CFGI | https://dashboard-dev.fomoed.io/api/scrape-cfgi |

# Please check [fomoed-docs](https://github.com/fomoed-dev/fomoed-docs) for project documentation

- https://github.com/fomoed-dev/fomoed-docs