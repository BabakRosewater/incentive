export async function onRequestGet(context) {
  const env = context.env || {};

  const token = env.GITHUB_TOKEN;
  const owner = env.GH_OWNER;
  const repo = env.INC_REPO || "incentive";
  const path = env.INC_APR_PATH || "incentive_apr.csv";
  const ref = env.GH_REF || "main";

  if (!token || !owner) {
    return new Response(
      JSON.stringify({
        error: "Missing required environment variables",
        required: ["GITHUB_TOKEN", "GH_OWNER"],
      }),
      {
        status: 500,
        headers: { "content-type": "application/json; charset=utf-8" },
      }
    );
  }

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(ref)}`;

  const gh = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3.raw",
      "User-Agent": "incentive-apr-api",
    },
  });

  if (!gh.ok) {
    const body = await gh.text();
    return new Response(
      JSON.stringify({
        error: "Failed to fetch incentive APR CSV from GitHub",
        status: gh.status,
        details: body.slice(0, 500),
      }),
      {
        status: gh.status,
        headers: { "content-type": "application/json; charset=utf-8" },
      }
    );
  }

  const csv = await gh.text();
  return new Response(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}
