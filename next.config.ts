import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

const config: NextConfig = { skipTrailingSlashRedirect: true, experimental: { serverActions: { bodySizeLimit: "10mb" } } };
export default config;
