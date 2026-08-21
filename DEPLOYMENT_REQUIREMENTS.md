# Deployment Requirements

Everything you need to get this site deployed. Grouped by criticality — decide what you can provide and we'll disable/hide the rest.

---

## 1. Core Infrastructure (site won't run without these)

### Supabase

| Variable | What it is |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public/anon API key |
| `PRIVATE_SUPABASE_SECRET` | Supabase service role key (admin access) |
| `NEXT_PUBLIC_SUPABASE_COOKIE_DOMAIN` | Your deploy domain (e.g. `.yourdomain.com`) |

**Note:** Database migrations live in a separate repo (`fomoed-dev/fomoed-db`). You need access to that repo to set up the schema/tables.

### Vercel

| Variable | What it is |
|---|---|
| `NEXT_PUBLIC_APP_URL` | Your deployed site URL |
| `CRON_SECRET` | Any random secret string — authenticates the two Vercel cron jobs (news scrape + payout processing) |
| `SENTRY_AUTH_TOKEN` | Only needed at build time for source map uploads (optional) |

---

## 2. Payments — Stripe

Without these, subscriptions/payments won't work. You could hide the paywall entirely if you don't need monetization.

| Variable | What it is |
|---|---|
| `PRIVATE_STRIPE_SECRET_KEY` | Stripe secret API key |
| `PRIVATE_STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRODUCT_IDS_PRO_PLAN` | Comma-separated Stripe product IDs for Pro plan |
| `STRIPE_PRODUCT_IDS_PLUS_PLAN` | Comma-separated Stripe product IDs for Plus plan |

---

## 3. Paid Data APIs (each powers specific widgets/features)

| Variable | Service | What breaks without it |
|---|---|---|
| `PRIVATE_COINGLASS_KEY` | Coinglass | Liquidation maps, heatmaps, delta, whale transactions, exchange pairs, economic calendar |
| `PRIVATE_CRYPTOPANIC_KEY` | CryptoPanic | News aggregation feed |
| `PRIVATE_CIGNALS_KEY` | Cignals.io | Crypto signals / footprint data |
| `CFGI_API_KEY` | CFGI | Crypto Fear & Greed Index widget |
| `BUNGEE_API_KEY` | Bungee/Socket | DEX cross-chain swaps widget |
| `OPENAI_API_KEY` | OpenAI (GPT-4) | AI news summaries, signal builder, details generation |
| `RAPID_API_KEY` | RapidAPI (yt-api) | YouTube video/channel search (optional) |
| `SANTIMENT_API_KEY` | Santiment | On-chain/social analytics (used via ingestion service) |
| `NEXT_PUBLIC_YOUTUBE_API_KEY` | YouTube Data API | YouTube widget |

---

## 4. Internal Backend Services

These are separate services the dashboard connects to. If you don't have them running, the features that depend on them won't work.

| Variable | Default Value | What it powers |
|---|---|---|
| `NEXT_PUBLIC_FOMOED_INGESTION_URL` | *(none)* | Profile images, waitlist, hyperliquid, ascendex, santiment, trading, gemach queries |
| `NEXT_PUBLIC_BACKEND_SMART_SIGNALS_BASE` | `http://localhost:8083` | Smart signals engine |
| `NEXT_PUBLIC_CIGNALS_WS_URL` | `wss://fomoed-livesocket.netbound.cz:3000` | Cignals live WebSocket relay (the `apps/livesocket` app) |
| `PUBLIC_NEWSLAB_URL` | `https://newslab.fomoed.io` | News content service |
| `NEXT_PUBLIC_FALLBACK_BINANCE_PROXY_URL` | `wss://binance-proxy.fomoed.io` | Binance WebSocket proxy |
| `NEXT_PUBLIC_AGGR_URL` | `https://aggr.fomoed.app` | Aggr trade widget (iframe) |
| `NEXT_PUBLIC_SOCKET_KEY` | *(none)* | API key sent in headers to internal services |

---

## 5. Redis (Caching)

Only used for the coinstats widget server-side cache. Optional — the widget will still work without it, just slower.

| Variable | Default |
|---|---|
| `REDIS_URL` | `redis://localhost:6379` |
| `REDIS_PASSWORD` | `foobared` |

---

## 6. Web3 / Wallet / Trading

| Variable | Service | What it powers |
|---|---|---|
| `NEXT_PUBLIC_REOWN_PROJECT_ID` | Reown (WalletConnect) | Wallet connect via RainbowKit for DEX |
| `NEXT_PUBLIC_ALPACA_API_KEY` | Alpaca | Stock/crypto trading widget |
| `NEXT_PUBLIC_ALPACA_SECRET_KEY` | Alpaca | Stock/crypto trading widget |
| `NEXT_PUBLIC_HYPERLIQUID_IS_TESTNET` | Hyperliquid | Perpetual DEX trading (defaults to testnet) |

---

## 7. Analytics & Monitoring (all optional)

| Variable | Service | Purpose |
|---|---|---|
| `NEXT_PUBLIC_MIXPANEL_TOKEN` | Mixpanel | Product analytics |
| `NEXT_PUBLIC_SENTRY_ENV` | Sentry | Error tracking environment tag (defaults to `development`) |
| `MONITOR_SECRET` | Internal | Health-check bypass header for middleware |

Vercel Analytics (`@vercel/analytics`) is also used but auto-configured by Vercel — no env var needed.

---

## 8. Feature Flags (all optional)

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_USE_NEW_LOGIN` | Toggles new login flow |
| `NEXT_PUBLIC_DISABLED_WG_SLUGS` | Comma-separated widget slugs to completely hide |
| `NEXT_PUBLIC_MAINTENANCE_WG_SLUGS` | Comma-separated widget slugs to show as "under maintenance" |

---

## 9. Livesocket App (`apps/livesocket`)

This is a separate Node.js WebSocket relay server — **not deployed to Vercel**. It proxies Cignals.io data to dashboard clients. Needs its own hosting (any Node server).

| Variable | Purpose |
|---|---|
| `CERT_PATH` | TLS certificate path (optional — falls back to unencrypted WS) |
| `KEY_PATH` | TLS private key path (optional) |

---

## Quick Decision Checklist

Use this to decide what to enable vs disable/hide:

- [ ] **Supabase** — required, no way around it
- [ ] **Stripe** — can disable if you don't need paid plans
- [ ] **Coinglass** — powers the most widgets, high priority
- [ ] **CryptoPanic** — news feed
- [ ] **Cignals** — signals data + livesocket relay
- [ ] **CFGI** — single widget (Fear & Greed)
- [ ] **OpenAI** — AI summaries (can disable AI features)
- [ ] **Bungee** — DEX swaps widget
- [ ] **Alpaca** — trading widget
- [ ] **WalletConnect/Reown** — wallet connections
- [ ] **YouTube API** — YouTube widget
- [ ] **Redis** — caching (optional)
- [ ] **Ingestion service** — separate backend (many widgets depend on it)
- [ ] **Smart Signals backend** — separate backend
- [ ] **Newslab** — separate backend
- [ ] **Binance proxy** — separate backend
- [ ] **Mixpanel/Sentry** — analytics (optional)
