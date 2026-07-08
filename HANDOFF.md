# Session Handoff — Clark Hyundai Incentive System

**Owner:** Babak Mohammadi, GM, Clark Hyundai (not an engineer — explain plainly,
confirm outward-facing/irreversible actions, recommend a default).
**Date of handoff:** 2026-07 (July program live).
**Companion docs in this repo:** `OPERATIONS.md` (runbook + full change log),
`CANONICAL_FEED.md` (feed endpoints + Cloudflare setup).

---

## 0. TL;DR — state & immediate next actions

- **The July 2026 program is LIVE** on the canonical feed (eff **7/2–8/3/2026**).
- **Architecture is done:** one source of truth (`incentive` repo) → one feed
  (`incentive-1ik.pages.dev`) → all apps read it. Drift is solved.
- **Immediate next actions:**
  1. **Save-A-Deal needs one Cloudflare Pages redeploy** to activate two merged
     code changes (IONIQ 9 matcher, word-track). The incentive *data* already
     flows automatically via the feed — only the code changes need the deploy.
  2. **Waiting on the AHM rep** to confirm: Palisade HEV Sales Event Cash
     $1,000 (trim/code), and belt-and-suspenders on the DC rate sweep / Palisade
     gas DC $1,000 / Kona-no-DC (all already applied from the official grid).
  3. **Two client-side apps still read raw GitHub** and need migrating to the
     feed (see §6) — they are **out of session scope** and must be added first.

---

## 1. Architecture — single source of truth → feed → consumers

```
incentive repo  (SOURCE OF TRUTH + FEED)
  incentive_apr.csv · retail_bonus_cash.csv · event_cash.csv
  functions/api/*  (Pages Functions read the CSVs via env.ASSETS)
        │ push to main → Cloudflare Pages auto-deploy
        ▼
  FEED = https://incentive-1ik.pages.dev
    /incentive_apr.csv /retail_bonus_cash.csv /event_cash.csv   (raw, CORS)
    /api/incentives /api/retail-bonus-cash /api/event-cash      (CORS+cache)
    /api/feed   (normalized JSON; ?active=1 filters expired)
        │
        ▼  consumers:
  Clark Inventory Finder   reads source live (GitHub INC_REPO via token) — auto-current
  Save-A-Deal Logic        reads /api/incentives live + bundled CSV fallback — auto-current for DATA
  Sales-Battle-Card        raw.githubusercontent.com/.../incentive_apr.csv  (NOT migrated)
  reengage-incentives-planner  raw.githubusercontent.com/.../incentive.csv  (NOT migrated)
```
**The deploy is the source:** push a CSV to `incentive` main → feed redeploys →
consumers pick it up within ~60s–5min. No tokens, no bundled copies to sync.

---

## 2. Repos, scope, branches

**In session scope (editable via GitHub MCP + local git):**
- `BabakRosewater/incentive` — source of truth + feed
- `BabakRosewater/clark-inventory-finder`
- `BabakRosewater/Save_A_Deal_Logic`
- (plus 11 others not central here: statement-builder, signature-sales-journey, etc.)

**NOT in scope (must be added before editing):**
- `BabakRosewater/Sales-Battle-Card`
- `BabakRosewater/reengage-incentives-planner`
- `BabakRosewater/specials_hub_app`  (studied; marketing pages delivered as files, not committed)

**Branch convention:** develop on **`claude/vigilant-euler-7xHzG`** in every repo.
Because each PR is merged, **restart it from main each time**:
`git fetch origin main && git checkout -B claude/vigilant-euler-7xHzG origin/main`.
Workflow: branch → commit → PR (GitHub MCP) → merge to `main` (owner okays).

**Note:** there is **no `add_repo`/`list_repos` tool** in-session and the
**Cloudflare MCP is intermittent** — infra/dashboard steps (create Pages project,
remove Access, redeploy, set env) are done by the owner.

---

## 3. What was done this session (by repo + PR)

**`incentive`:** #6 June program · #7 Dealer Choice bonus fix · #8 Summer partial
(Tucson ICE + Santa Fe → 0%) · **#9 canonical feed** · #10 OPERATIONS.md ·
**#11 full July program** · #12 OPERATIONS.md July update.

**`clark-inventory-finder`:** #26 — deleted the dead bundled `incentive/` mirror
(app reads the source live; folder was unused + stale). Also studied the whole app.

**`Save_A_Deal_Logic`:** #265 — incentive lane reads the feed live (+ bundled
fallback, refreshed) · #266 — word-track June refresh · **#278 — IONIQ 9 matcher**
· #279 — word-track July retail (Kona $1,000; +Santa Fe $3,000, +Santa Cruz $2,000).

**`specials_hub_app` (out of scope, files delivered not committed):**
`june_2026_specials.htm` (from May template), `june_2026_specials_drift.htm`
(removed zero-doc-fee, rebuilt Car Care Days service section, cleaned disclosures),
and a review of `clark_hyundai_june_all_offers_email.html` (flagged missing
unsubscribe/CAN-SPAM + `[CUSTOMER FIRST NAME]` merge tag).

---

## 4. July 2026 program — current live values (eff 7/2–8/3/2026, 60-mo)

| Model | Low APR (+BC) | Dealer Choice (rate + BC) | Retail Bonus Cash |
|---|---|---|---|
| Tucson ICE | 0% | 5.19% + $3,000 | — |
| Tucson HEV | 1.99% | 5.19% + $2,000 | — |
| Tucson PHEV | 0% | 5.19% + $4,000 | — |
| Santa Fe ICE | 0% + $1,500 | — | $3,000 |
| Santa Fe HEV | 0% + $1,500 | — | $3,000 |
| Sonata ICE | 0.99% | 5.69% + $2,500 | — |
| Sonata HEV | 1.99% | 5.69% + $1,750 | — |
| Palisade gas | 3.99% | 5.69% + $1,000 | — |
| Palisade HEV | 4.49% | 5.69% + $500 | — |
| Kona ICE | 3.49% | **none** | $1,000 |
| Elantra ICE/HEV/N | 3.49 / 3.49 / 5.49% | — | $2,000 / $1,000 / — |
| Santa Cruz | 4.99% | — | $2,000 |
| Venue | 5.49% | — | — |
| IONIQ 5 | 0% + $1,000 | 5.69% + $7,000 | $7,000 |
| IONIQ 9 | 0% + $3,000 | 5.69% + $10,000 | $10,000 |

Event cash (`event_cash.csv`): Palisade gas Calligraphy $2,000 / XRT Pro $2,000 /
Limited $1,000. **Palisade HEV $1,000 held** (pending rep). All dates 8/3/2026.

---

## 5. Monthly incentive update runbook

1. Edit the 3 CSVs in `incentive` (keyed by `model_code`; keep header/columns).
   - `incentive_apr.csv`: `Low APR` + `Dealer Choice` rows. **60-month display
     only** (`term_min=60,term_max=60`) — no 36/48/72 rows. **Lease is out of
     scope** (separate file). MY2025 out of scope.
   - APR bonus cash → `incentive_apr.csv` (`bonus_cash`); flat cash rebates →
     `retail_bonus_cash.csv`; sales event cash → `event_cash.csv`.
2. Set `end_date` (M/D/YYYY) to the program expiration.
3. Branch → PR → merge to `main`. Feed + consumers auto-update.
4. **If a NEW model is added** (like IONIQ 9): check Save-A-Deal's matcher —
   `functions/_lib/incentive_apr.js` `KNOWN_MODELS_ORDERED` / `MODEL_CANONICAL`
   / EV powertrain / resolver must include it, or its incentives won't attach in
   Save-A-Deal (Clark matches dynamically, so Clark is usually fine). Apps match
   by **`model_desc`**, not `model_code`.

**Model code note:** the CSV's `model_code` column uses a **legacy** scheme
(`Q14…`, `854…`, `654…`). The current factory master list uses a different
scheme (`KN…`, `TC…`, `SF…`, and IONIQ 9 = `I95AAYCZW7AZ` SEL /
`I99AAYBZW6AZ` Perf Calligraphy; IONIQ 5 XRT = `I55AAYCZW5AZ`). Mixed formats
are cosmetic only — matching is by `model_desc`. A future cleanup could
reconcile them.

---

## 6. Open items / TODO

- [ ] **Redeploy Save-A-Deal** (Cloudflare Pages) to activate PR #278 + #279 code.
- [ ] **Palisade HEV Sales Event Cash $1,000** — add to `event_cash.csv` once the
      rep confirms which HEV trim(s)/code.
- [ ] **Rep confirm (belt-and-suspenders):** DC rate 5.39→5.69/5.19, Palisade gas
      DC $1,000, Kona no-DC (all applied from the official grid already).
- [ ] **Migrate client-side apps to the feed** (add repos to scope first):
      - `Sales-Battle-Card` → `region_incentives/index.html`: change `CSV_URL` /
        `EVENT_CASH_URL` from raw GitHub → `https://incentive-1ik.pages.dev/incentive_apr.csv` and `/event_cash.csv`
      - `reengage-incentives-planner` → `app.js`: `DEFAULT_INCENTIVE_URL` → `https://incentive-1ik.pages.dev/incentive.csv`
      - This also re-enables the option to make `incentive` **private** (both
        currently read raw GitHub and would break if it goes private).
- [ ] **Save-A-Deal (optional):** derive `apr_highlights`/`retail_bonus_cash_highlights`
      in `specials_messaging.js` from the feed so the word-track never drifts.
- [ ] **IONIQ 5 SE RWD** ($279/24mo lease) — lease file, intentionally out of scope.
- [ ] **Specials marketing** (`specials_hub_app`): July pages/email not built; the
      June `.htm` files were delivered as files only (repo out of scope).
- [ ] **Refresh `end_date`** past 8/3/2026 at the next program window.

---

## 7. Gotchas & verification

- **Consumers cache ~60s–5min** — allow a few minutes after a merge.
- **Feed serves ALL repo files** at root (`raw_data.csv`, `incentive.csv`,
  `ms_feb_*`) since output dir = `/`. Move feed CSVs to a subfolder if you ever
  need to hide the others.
- **Save-A-Deal** self-updates DATA from the feed at runtime; its *bundled
  fallback snapshot* only refreshes on redeploy.
- **Verify the live feed** (bash):
  ```
  curl -s "https://incentive-1ik.pages.dev/api/feed" | python3 -m json.tool | head
  curl -s "https://incentive-1ik.pages.dev/api/incentives?_cb=$(date +%s)" | grep "854K2APT.*Low APR"   # Tucson PHEV -> 0
  ```
- **Verify Clark app:** `curl -s https://clark-inventory-finder.pages.dev/api/bootstrap` →
  `stats.newUnitsWithOffers` should be > 0.
- **Local audit** of current CSV state: `incentive` repo has the files on `main`;
  group by model/powertrain/type to compare against a bulletin before editing.
