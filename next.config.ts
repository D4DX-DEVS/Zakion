import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];

const config: NextConfig = {
  skipTrailingSlashRedirect: true,
  // uploads go through server actions: one request may carry up to two files of the 25 MB video limit in src/lib/upload.ts
  experimental: { serverActions: { bodySizeLimit: "50mb" } },
  headers: async () => [
    { source: "/admin/:path*", headers: noindex },
    { source: "/api/:path*", headers: noindex },
  ],
};
export default config;
