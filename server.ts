import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createProxyMiddleware } from "http-proxy-middleware";

const API_TARGET = process.env.API_TARGET || "http://127.0.0.1:8000";
const apiProxy = createProxyMiddleware({
  target: API_TARGET,
  changeOrigin: true,
  pathFilter: (path: string) =>
    path.startsWith("/api") ||
    path.startsWith("/docs") ||
    path === "/openapi.json" ||
    path.startsWith("/redoc"),
});

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3000", 10);

  // Proxy API and OpenAPI endpoints to the Python FastAPI backend
  app.use(apiProxy);

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `Simple Email server on http://0.0.0.0:${PORT}`
    );
    console.log(`  → API proxied to ${API_TARGET}`);
  });
}

startServer();

