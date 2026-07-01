// functions/_lib/feed.js
// Shared helpers for the canonical incentive feed.
//
// Single source of truth: this repo's CSV files, served by THIS Pages
// deployment via the ASSETS binding. The deploy IS the source — every push
// to the repo redeploys and the feed reflects it. No GitHub fetch, no token,
// no bundled copies in other apps.

export const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Read a CSV that ships inside this deployment (e.g. "incentive_apr.csv").
export async function loadCsvText(env, name) {
  if (!env || !env.ASSETS || typeof env.ASSETS.fetch !== "function") {
    throw new Error("ASSETS binding missing (deploy this repo as a Cloudflare Pages project)");
  }
  const safe = String(name).replace(/^\/+/, "");
  const r = await env.ASSETS.fetch(new Request(`https://assets.local/${safe}`));
  if (!r.ok) throw new Error(`asset "${safe}" not found (${r.status})`);
  return await r.text();
}

export function handleOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export function csvResponse(text, maxAge = 300) {
  return new Response(text, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "cache-control": `public, max-age=${maxAge}`,
      ...CORS,
    },
  });
}

export function jsonResponse(obj, status = 200, maxAge = 300) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": status === 200 ? `public, max-age=${maxAge}` : "no-store",
      ...CORS,
    },
  });
}

// RFC-4180-ish CSV parser: handles quotes, escaped quotes, and CRLF.
// Returns { headers: [...], rows: [ {col: val, ...}, ... ] }.
export function parseCSV(text) {
  const s = String(text || "").replace(/^﻿/, "");
  const grid = [];
  let cur = [], field = "", inQuotes = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i], next = s[i + 1];
    if (inQuotes) {
      if (c === '"' && next === '"') { field += '"'; i++; continue; }
      if (c === '"') { inQuotes = false; continue; }
      field += c; continue;
    }
    if (c === '"') { inQuotes = true; continue; }
    if (c === ",") { cur.push(field); field = ""; continue; }
    if (c === "\n") { cur.push(field); grid.push(cur); cur = []; field = ""; continue; }
    if (c === "\r") { continue; }
    field += c;
  }
  if (field.length || cur.length) { cur.push(field); grid.push(cur); }
  if (!grid.length) return { headers: [], rows: [] };
  const headers = grid[0].map((h) => String(h || "").trim());
  const rows = [];
  for (let i = 1; i < grid.length; i++) {
    const r = grid[i];
    if (!r || r.every((x) => String(x || "").trim() === "")) continue;
    const obj = {};
    for (let j = 0; j < headers.length; j++) obj[headers[j]] = (r[j] ?? "").trim();
    rows.push(obj);
  }
  return { headers, rows };
}
