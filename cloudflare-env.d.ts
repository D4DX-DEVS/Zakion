interface CloudflareEnv {
  DB: D1Database;
  MEDIA: R2Bucket;
  ASSETS: Fetcher;
  ADMIN_USER?: string;
  SITE_URL?: string;
  ADMIN_PASSWORD: string;
  SESSION_SECRET: string;
}
