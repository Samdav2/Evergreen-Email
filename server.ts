import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createProxyMiddleware } from "http-proxy-middleware";

const API_TARGET = process.env.API_TARGET || "http://127.0.0.1:8000" + "/api";
const apiProxy = createProxyMiddleware({
  target: API_TARGET,
  changeOrigin: true,
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Proxy API and OpenAPI endpoints to the Python FastAPI backend
  app.use("/api", apiProxy);
  app.use("/docs", apiProxy);
  app.use("/openapi.json", apiProxy);
  app.use("/redoc", apiProxy);

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
      `Evergreen Mail dev server on http://0.0.0.0:${PORT}`
    );
    console.log(`  → API proxied to ${API_TARGET}`);
  });
}

startServer();
