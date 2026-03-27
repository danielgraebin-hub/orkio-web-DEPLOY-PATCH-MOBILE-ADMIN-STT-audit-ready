/**
 * ORKIO WEB RUNTIME SERVER
 * server.cjs (consolidated production version)
 *
 * Responsibilities:
 * - serve dist/
 * - expose /env.js runtime config
 * - proxy /api to backend
 * - health check endpoint
 */

const express = require("express");
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

// ==============================
// CONFIG
// ==============================

const PORT = process.env.PORT || 8080;

const API_BASE_URL =
  process.env.API_BASE_URL ||
  "https://web-api-orkio-oficial.up.railway.app";

const DIST_DIR = path.join(__dirname, "dist");

// ==============================
// HEALTH CHECK
// ==============================

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "orkio-web",
    timestamp: new Date().toISOString(),
  });
});

// ==============================
// RUNTIME ENV INJECTION
// ==============================

app.get("/env.js", (req, res) => {
  res.setHeader("Content-Type", "application/javascript");

  const runtimeEnv = {
    VITE_ENABLE_VOICE: process.env.VITE_ENABLE_VOICE,
    VITE_ENABLE_REALTIME: process.env.VITE_ENABLE_REALTIME,
    VITE_ENABLE_RAG: process.env.VITE_ENABLE_RAG,

    VITE_SUMMIT_VOICE_MODE: process.env.VITE_SUMMIT_VOICE_MODE,
    VITE_SUMMIT_LANGUAGE_PROFILE: process.env.VITE_SUMMIT_LANGUAGE_PROFILE,
    VITE_ORKIO_RUNTIME_MODE: process.env.VITE_ORKIO_RUNTIME_MODE,

    VITE_REALTIME_MODEL: process.env.VITE_REALTIME_MODEL,
    VITE_REALTIME_VOICE: process.env.VITE_REALTIME_VOICE,

    VITE_REALTIME_AUTO_RESPONSE_ENABLED:
      process.env.VITE_REALTIME_AUTO_RESPONSE_ENABLED,

    VITE_REALTIME_VAD_THRESHOLD:
      process.env.VITE_REALTIME_VAD_THRESHOLD,

    VITE_REALTIME_VAD_SILENCE_MS:
      process.env.VITE_REALTIME_VAD_SILENCE_MS,

    VITE_REALTIME_VAD_HOLD_MS:
      process.env.VITE_REALTIME_VAD_HOLD_MS,

    VITE_REALTIME_RESTART_AFTER_TTS_MS:
      process.env.VITE_REALTIME_RESTART_AFTER_TTS_MS,

    VITE_REALTIME_TRANSCRIBE_LANGUAGE:
      process.env.VITE_REALTIME_TRANSCRIBE_LANGUAGE,

    VITE_STT_LANGUAGE: process.env.VITE_STT_LANGUAGE,

    VITE_DEFAULT_TENANT: process.env.VITE_DEFAULT_TENANT,
  };

  res.send(
    `window.__ORKIO_ENV__ = ${JSON.stringify(runtimeEnv, null, 2)};`
  );
});

// ==============================
// API PROXY
// ==============================

app.use(
  "/api",
  createProxyMiddleware({
    target: API_BASE_URL,
    changeOrigin: true,
    secure: true,
    logLevel: "warn",
  })
);

// ==============================
// STATIC FILES
// ==============================

app.use(express.static(DIST_DIR));

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(DIST_DIR, "index.html"));
});

// ==============================
// START SERVER
// ==============================

app.listen(PORT, () => {
  console.log(`Orkio Web running on port ${PORT}`);
  console.log(`Proxying /api -> ${API_BASE_URL}`);
});
