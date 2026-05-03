// Shared CORS handler for cross-origin POSTs from sister surfaces
// (pmclaws.com, janeyoubradley.com) to radar.pmclaws.com /api/subscribe*.

const ALLOWED_ORIGINS = new Set<string>([
  "https://radar.pmclaws.com",
  "https://pmclaws.com",
  "https://www.pmclaws.com",
  "https://janeyoubradley.com",
  "https://www.janeyoubradley.com",
  // Local dev across all three projects, common ports
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:8000",
]);

export function corsHeaders(origin: string | null): HeadersInit {
  const ok = origin && ALLOWED_ORIGINS.has(origin);
  return {
    "Access-Control-Allow-Origin": ok ? origin : "",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export function preflight(request: Request): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request.headers.get("origin")),
  });
}
