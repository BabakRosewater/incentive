// GET /api/event-cash — raw event_cash.csv from this deployment (CORS).
import { loadCsvText, csvResponse, handleOptions, CORS } from "../_lib/feed.js";

export function onRequestOptions() { return handleOptions(); }

export async function onRequestGet({ env }) {
  try {
    return csvResponse(await loadCsvText(env, "event_cash.csv"));
  } catch (e) {
    return new Response(`incentive feed error: ${e.message}`, { status: 502, headers: CORS });
  }
}
