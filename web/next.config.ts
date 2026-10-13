import type { NextConfig } from "next";
import path from "node:path";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  // A stray lockfile exists in a parent directory; pin tracing to this app.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;

// Enables Cloudflare bindings (env, R2) in `next dev` only. It boots a local workerd,
// which must not run during `next build`.
if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}
