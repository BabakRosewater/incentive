# Incentive System — Operations, Architecture & Change Log

This repo is the **single source of truth** for Clark Hyundai incentive data
**and** the canonical feed that every app reads. This doc is the runbook for
updating incentives and the record of how the system is wired.

---

## 1. Architecture (single source of truth)

```
incentive repo  (this repo)
  ├─ incentive_apr.csv          ← APR programs (Low APR + Dealer Choice), by model_code
  ├─ retail_bonus_cash.csv      ← retail bonus cash
  ├─ event_cash.csv             ← event cash
  └─ functions/api/*            ← Cloudflare Pages Functions serving the above
        │
        │  git push to main  →  Cloudflare Pages auto-deploy
        ▼
  CANONICAL FEED  →  https://incentive-1ik.pages.dev
        ├─ /incentive_apr.csv, /retail_bonus_cash.csv, /event_cash.csv  (raw, CORS)
        ├─ /api/incentives, /api/retail-bonus-cash, /api/event-cash     (CORS + cache)
        └─ /api/feed  (normalized JSON of all three; ?active=1 filters expired)
        │
        ▼  all consumers read the feed / source — no bundled copies
  ┌──────────────────────────────────────────────────────────────┐
  │ Clark Inventory Finder   reads source live (GitHub INC_REPO)  │
  │ Save-A-Deal Logic        reads /api/incentives (bundled = fallback only) │
  │ Sales-Battle-Card        (pending) → will read /incentive_apr.csv        │
  │ reengage-planner         (pending) → will read /incentive.csv            │
  └──────────────────────────────────────────────────────────────┘
```

**The deploy is the source.** Push a CSV change to `main` → the feed redeploys
automatically → all consumers pick it up. No tokens, no copies to hand-sync.

See `CANONICAL_FEED.md` for endpoint details and Cloudflare setup.

---

## 2. Monthly / program-update runbook

To update incentives (e.g., a new Hyundai program month):

1. Edit the CSVs in this repo:
   - **`incentive_apr.csv`** — APR programs. Keyed by `model_code`. Two row
     types per model where applicable: **`Low APR`** and **`Dealer Choice`**.
     Business rule: **60-month display only** (`term_min=60`, `term_max=60`);
     do not add 36/48/72-month rows.
   - **`retail_bonus_cash.csv`** — retail/cash offers (e.g., Kona $750).
   - **`event_cash.csv`** — event cash.
2. Keep the header row and column order **unchanged**.
3. Set `end_date` (M/D/YYYY) to the program expiration.
4. Commit → open PR → merge to `main`. The feed (and every consumer) updates
   automatically within the cache window (~60s–5min).

**Where each kind of offer goes**
- APR rate / APR bonus cash → `incentive_apr.csv`
- Flat retail/cash rebates → `retail_bonus_cash.csv`
- Event cash → `event_cash.csv`
- Aged-inventory / conditional rebates → **not** in these files unless
  age-based logic exists downstream.

**What the feed does NOT model:** 72-month terms, 90-day-deferred, cash-only
(no-APR) offers. The consuming apps are 60-month/APR-oriented; represent the
60-month option and put cash in the retail file.

---

## 3. Change log — July 2026 program (Summer Sales Event)

Official **MS Region Incentive Summary, effective 7/2/2026 → 8/3/2026**.
60-month only; lease, 72-month, and MY2025 out of scope. (Earlier June rows and
the incremental Tucson/Santa Fe steps below were superseded by the full July
load in PR #11.)

**`incentive` repo**
- **PR #6** — June 2026 program load (`incentive_apr.csv`, `retail_bonus_cash.csv` incl. Kona ICE $750, `event_cash.csv`).
- **PR #7** — Dealer Choice `bonus_cash` correction (Tucson ICE 3000→2250, Tucson HEV 2750→2000, IONIQ 5 6000→7000).
- **PR #8** — Summer event: **Tucson ICE Low APR 0.99% → 0%** (5 trims); **Santa Fe (all) Low APR 1.99% → 0% + $1,500** (13 trims: 8 Hybrid, 5 ICE 2.5T). Dealer Choice / PHEV / Hybrid Low APR untouched.
- **PR #9** — **Canonical feed**: Pages Functions serve the CSVs via `env.ASSETS` (CORS + `/api/feed` JSON); `_headers`; `CANONICAL_FEED.md`.
- **PR #10** — `OPERATIONS.md` (this doc).
- **PR #11** — **Full July program** (60-mo, eff 7/2–8/3): Tucson PHEV Low APR 4.99→**0%**; Dealer Choice APR rate → **5.19%** (Tucson) / **5.69%** (others); Tucson ICE DC bonus 2250→**3000**; Palisade gas DC bonus →**1000**; add Tucson PHEV DC (5.19%/$4,000); **remove Kona DC**; **add IONIQ 9** (Low APR 0%+$3,000, DC 5.69%+$10,000). Retail: Kona 750→1000, Santa Fe 2750→3000, Santa Cruz 1750→2000, add IONIQ 5 $7,000 + IONIQ 9 $10,000. All `end_date → 8/3/2026`.

**`clark-inventory-finder`**
- **PR #26** — Deleted the dead bundled `incentive/` CSV mirror (app reads the source live; folder was unused + stale).

**`Save_A_Deal_Logic`**
- **PR #265** — `_lib/incentive_apr.js` now reads the canonical feed live (bundled CSV = offline fallback); refreshed the stale bundled snapshot (6/1 → current). No more per-update redeploy for data.
- **PR #266** — Refreshed the specials messaging word-track (analyzer prompt + email templates, both `lib/` and `functions/_lib/` copies): Tucson 0.99→0%, Santa Fe 1.99%+$1,000 → 0%+$1,500, Santa Fe Hybrid 1.99%+$500 → 0%+$1,500; `month_label` June→July.
- **PR #278** — Incentive matcher now recognizes **IONIQ 9** (model + EV powertrain + resolver) so the July IONIQ 9 program attaches to IONIQ 9 cases.
- **PR #279** — Word-track July retail refresh: Kona $750→**$1,000**; add Santa Fe **$3,000** + Santa Cruz **$2,000** to featured list.

**Net incentive state (live on feed, eff 7/2–8/3/2026):** Tucson ICE **0%**, Tucson PHEV **0%**,
Santa Fe ICE+HEV **0% + $1,500**, Tucson Hybrid **1.99%**, Sonata **0.99%**, Elantra/Elantra HEV/Kona **3.49%**,
Palisade gas **3.99%**, Palisade HEV **4.49%**, Santa Cruz **4.99%**, Venue **5.49%**, IONIQ 5 **0% + $1,000**, IONIQ 9 **0% + $3,000**.
Dealer Choice: **5.19%** (Tucson) / **5.69%** (others); **Kona has no DC**. Retail: Kona **$1,000**, Santa Fe **$3,000**, Santa Cruz **$2,000**, Elantra $2,000/$1,000, IONIQ 5 $7,000, IONIQ 9 $10,000. All `end_date 8/3/2026`.

---

## 4. Open items / TODO

- [x] **July program loaded** (PR #11) from the MS Region Summary, eff 7/2–8/3/2026.
- [ ] **Palisade HEV Sales Event Cash $1,000** — held pending trim/code confirm from the rep.
- [ ] **Rep confirm (belt-and-suspenders):** the DC rate sweep (5.39→5.69/5.19), Palisade gas DC $1,000, and Kona no-DC — all applied straight from the official grid.
- [ ] **Refresh `end_date`** past 8/3/2026 when the next window is confirmed.
- [ ] **Migrate the two client-side apps to the feed** (one-line URL swap each;
      both currently read raw GitHub and will break if this repo goes private):
      - `Sales-Battle-Card` → `region_incentives/index.html`: raw URLs → `https://incentive-1ik.pages.dev/incentive_apr.csv` and `/event_cash.csv`
      - `reengage-incentives-planner` → `app.js`: raw URL → `https://incentive-1ik.pages.dev/incentive.csv`
- [ ] **Save-A-Deal:** optionally derive `apr_highlights` in
      `specials_messaging.js` from the feed so the word-track never drifts
      (curation stays hardcoded; only the numbers auto-update).
- [ ] **Privacy:** making this repo private is now safe for feed consumers, but
      requires the two client-side apps migrated first (they read raw GitHub).

---

## 5. Gotchas

- **Consumers cache** ~60s–5min; allow a few minutes after a merge.
- **Save-A-Deal** ships a bundled CSV fallback — it self-updates from the feed
  at runtime, but the *fallback snapshot* only refreshes on its redeploy.
- Deploying this repo from output dir `/` serves **every** file publicly
  (raw_data.csv, incentive.csv, ms_feb_*). Move feed CSVs to a subfolder if you
  need to hide the others.
