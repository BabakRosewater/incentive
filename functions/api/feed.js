// GET /api/feed.json — one normalized JSON payload with all three incentive
// tables, parsed from this deployment's CSVs. For consumers that would rather
// not parse CSV themselves.
//
// Optional query params:
//   ?active=1   -> keep only rows whose end_date (M/D/YYYY) is today or later
import { loadCsvText, parseCSV, jsonResponse, handleOptions } from "../_lib/feed.js";

const FILES = {
  incentive_apr: "incentive_apr.csv",
  retail_bonus_cash: "retail_bonus_cash.csv",
  event_cash: "event_cash.csv",
};

function parseMDY(s) {
  const m = String(s || "").trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  return new Date(+m[3], +m[1] - 1, +m[2], 23, 59, 59);
}

export function onRequestOptions() { return handleOptions(); }

export async function onRequestGet({ env, request }) {
  try {
    const url = new URL(request.url);
    const activeOnly = url.searchParams.get("active") === "1";
    const now = new Date();

    const out = {
      ok: true,
      generatedAt: new Date().toISOString(),
      source: "incentive repo — Cloudflare Pages ASSETS (deploy is the source of truth)",
      activeOnly,
      counts: {},
      data: {},
    };

    for (const [key, file] of Object.entries(FILES)) {
      let rows = parseCSV(await loadCsvText(env, file)).rows;
      if (activeOnly) {
        rows = rows.filter((r) => {
          const dt = parseMDY(r.end_date);
          return dt ? dt >= now : true;
        });
      }
      out.data[key] = rows;
      out.counts[key] = rows.length;
    }

    return jsonResponse(out);
  } catch (e) {
    return jsonResponse({ ok: false, error: e.message }, 502);
  }
}
