// Minimal test API for Unkey Compute. No dependencies.
const http = require("node:http");

const port = Number(process.env.PORT) || 8080;
const startedAt = Date.now();

function send(res, status, body) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1e6) req.destroy();
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error("invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");

  if (req.method === "GET" && url.pathname === "/") {
    return send(res, 200, {
      name: "unkey-test-api",
      endpoints: ["GET /healthz", "GET /hello?name=you", "POST /echo", "GET /info"],
    });
  }

  if (req.method === "GET" && url.pathname === "/healthz") {
    return send(res, 200, { status: "ok" });
  }

  if (req.method === "GET" && url.pathname === "/hello") {
    const name = url.searchParams.get("name") || "world";
    return send(res, 200, { message: `Hello, ${name}!` });
  }

  if (req.method === "POST" && url.pathname === "/echo") {
    try {
      return send(res, 200, { received: await readJson(req) });
    } catch (err) {
      return send(res, 400, { error: err.message });
    }
  }

  if (req.method === "GET" && url.pathname === "/info") {
    return send(res, 200, {
      uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
      node: process.version,
      region: process.env.UNKEY_REGION || null,
    });
  }

  send(res, 404, { error: "not found" });
});

server.listen(port, () => console.log(`listening on :${port}`));

// Unkey sends SIGTERM when replacing an instance; drain and exit cleanly.
for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => {
    console.log(`${signal} received, shutting down`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 10_000).unref();
  });
}
