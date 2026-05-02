# incentive

Repository containing incentive/lease CSV datasets and Cloudflare Pages Functions that expose APR incentive data via HTTP endpoints.

## Repository contents

### Data files (CSV)
Top-level CSV files provide raw incentive and vehicle-related data snapshots, including:

- `incentive.csv`
- `incentive_apr.csv`
- `incentive_update_dec_2025.csv`
- `raw_data.csv`
- `retail_bonus_cash.csv`
- `event_cash.csv`
- `lease_disclosure_feb_2026`
- `lease_offers_feb_2026.csv`
- `ms_feb_2026_incentives_2026_only.csv`
- `ms_feb_2026_incentives_2026_only_60mo.csv`
- `new_used_vehicle_info.csv`

### API implementation
API handlers are implemented under `functions/api/`:

- `functions/api/incentive-apr.js` (primary endpoint implementation)
- `functions/api/incentives.js` (compatibility alias)

## API endpoints

### `GET /api/incentive-apr`
Returns APR incentive CSV content fetched at request time from GitHub contents API.

#### Response behavior
- **200**: Returns CSV body (`text/csv; charset=utf-8`)
- **500**: Missing required environment variables
- **GitHub status passthrough**: If GitHub fetch fails, endpoint responds with that upstream status and a JSON error payload

#### Required environment variables
- `GITHUB_TOKEN`: GitHub token with read access to the source repo
- `GH_OWNER`: GitHub owner or organization name

#### Optional environment variables
- `INC_REPO` (default: `incentive`)
- `INC_APR_PATH` (default: `incentive_apr.csv`)
- `GH_REF` (default: `main`)

#### Upstream fetch details
- URL template:
  - `https://api.github.com/repos/{GH_OWNER}/{INC_REPO}/contents/{INC_APR_PATH}?ref={GH_REF}`
- Headers used:
  - `Authorization: Bearer {GITHUB_TOKEN}`
  - `Accept: application/vnd.github.v3.raw`
  - `User-Agent: incentive-apr-api`

#### Caching
- `Cache-Control: public, max-age=300`

### `GET /api/incentives`
Compatibility alias that re-exports `onRequestGet` from `incentive-apr.js`.
Behavior is identical to `GET /api/incentive-apr`.
