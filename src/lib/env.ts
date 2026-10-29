import { getCloudflareContext } from "@opennextjs/cloudflare";

export const env = () => getCloudflareContext().env as CloudflareEnv;
export const db = () => env().DB;
