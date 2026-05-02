# incentive

## API endpoints in this repo

This repository now includes a Cloudflare Pages Functions API endpoint for APR incentives.

### `GET /api/incentive-apr`
- Returns raw CSV from GitHub.
- Intended source file: `incentive_apr.csv`.

### `GET /api/incentives`
- Alias of `/api/incentive-apr` for compatibility.

## Required environment variables
- `GITHUB_TOKEN`: GitHub token with read access to the target repo.
- `GH_OWNER`: GitHub owner/org.

## Optional environment variables
- `INC_REPO` (default: `incentive`)
- `INC_APR_PATH` (default: `incentive_apr.csv`)
- `GH_REF` (default: `main`)
