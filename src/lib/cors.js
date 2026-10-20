export function corsHeaders(request) {
  const origin = request.headers.get("origin");
  const allowed = ["http://localhost:5173", "http://127.0.0.1:5173", ...(process.env.FRONTEND_URL || "").split(",").map((value) => value.trim())];
  return {
    ...(origin && allowed.includes(origin) ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" } : {}),
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}
