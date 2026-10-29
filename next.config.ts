import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];

const config: NextConfig = {
  skipTrailingSlashRedirect: true,
  experimental: { serverActions: { bodySizeLimit: "10mb" } },
  headers: async () => [
    { source: "/admin/:path*", headers: noindex },
    { source: "/api/:path*", headers: noindex },
  ],
};
export default config;
