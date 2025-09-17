# Fomoed Monorepo

### Changelog

See [CHANGELOG.md](./CHANGELOG.md)

### Environments


#### Development deploy

- App: https://dashboard-dev.fomoed.io
- Built from `develop` branch
- Linked to https://supabase.com/dashboard/project/ijgmstxxracfrqwzxdhq
- Stripe test cards can be used for testing payments: https://docs.stripe.com/testing

#### Staging deploy

- App: https://staging.fomoed.io
- Built from the latest branch which's name starts with `release`
- Linked to https://supabase.com/dashboard/project/btgeprcuhlfnnzzrwsuu - same as production

#### Production deploy
- App: https://fomoed.io
- Built from `main` branch
- Linked to https://supabase.com/dashboard/project/btgeprcuhlfnnzzrwsuu

### Database

This project uses supabase. The same supabase project is used across the dashboard and the marketing app.

Database migrations are stored in: https://github.com/fomoed-dev/fomoed-db

Please follow instructions in that repo when making changes to the DB schema.


### What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `dashboard`: The new version of the dashboard being developed in React
- `livesocket`: A proxy used with the footprint chart, deployed on Digital Ocean

### Build

To build all apps and packages, run the following command:

```
pnpm build
```

### Develop

To start the app in dev mode, run:

```
pnpm dev
```

### Test

**Before first run setup**

Before running the test pipeline locally, it's needed to perform a few steps.

1. Clone the `supabase-db` repository.
2. Run `./scripts/setup_tests.sh`
3. Create `apps/dashboard/.env.test` file.

**Running e2e test suite locally**

Start the dev server connected to the local environemnt. This will spin up a local supabase instance, apply all migrations from your cloned `fomoed-db` repo.

```bash
pnpm dev:local
```

Run playwright test suite:

```bash
cd apps/dashboard
npx playwright test --ui
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