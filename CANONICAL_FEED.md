# Canonical Incentive Feed

This repo is the **single source of truth** for Clark Hyundai incentive data.
When deployed as a Cloudflare Pages project, the deployment *is* the feed:
every push to `main` redeploys and the feed updates automatically. There are
**no bundled copies** to keep in sync anywhere else.

## Endpoints (once deployed)

Base URL = the Pages deployment (e.g. `https://incentive.pages.dev`, or a
custom domain such as `https://incentives.clarkhyundai.com`).

| URL | Returns |
|---|---|
| `/incentive_apr.csv` | Raw APR programs CSV (static asset, CORS) |
| `/retail_bonus_cash.csv` | Raw retail bonus cash CSV (static asset, CORS) |
| `/event_cash.csv` | Raw event cash CSV (static asset, CORS) |
| `/api/incentives` / `/api/incentive-apr` | APR programs CSV via function (CORS + cache) |
| `/api/retail-bonus-cash` | Retail bonus cash CSV via function |
| `/api/event-cash` | Event cash CSV via function |
| `/api/feed.json` | All three tables, normalized JSON (`?active=1` to filter to non-expired rows) |

All responses set `Access-Control-Allow-Origin: *` and `Cache-Control: public,
max-age=300`, so both server-side and **browser** apps can read them directly.

## How it works

- The CSVs live at the repo root and are served as **static assets**.
- The Pages Functions in `functions/api/*` read those same assets via the
  `env.ASSETS` binding — no GitHub fetch, no `GITHUB_TOKEN`, no external
  dependency at request time. The deploy is the source.

## Cloudflare setup (one-time)

1. Connect this repo to a **Cloudflare Pages** project (git integration →
   auto-deploy on push). Build command: none. Output directory: `/` (root).
2. **Remove Cloudflare Access** from the project (or scope it so the feed URLs
   are publicly readable) — consumers, including browser apps, must be able to
   GET these URLs.
3. (Optional) Add a custom domain.

## Consumers — migrate everyone to this feed

Replace each app's incentive data source with a feed URL above. Retire all
local/bundled copies once migrated.

| App | Old source | New source |
|---|---|---|
| Clark Inventory Finder | GitHub Contents API (token) | `/api/incentives` etc. (or keep raw CSV URLs) |
| Save-A-Deal Logic | bundled `/incentive/*.csv` via ASSETS | fetch `/api/incentives` (+ bundled snapshot as offline fallback) |
| Sales-Battle-Card | `raw.githubusercontent.com/.../incentive_apr.csv` | `/incentive_apr.csv` |
| reengage-incentives-planner | `raw.githubusercontent.com/.../incentive.csv` | `/incentive.csv` (or `/api/...`) |

Goal state: **one source, one feed, zero copies.**
