interface CloudflareEnv {
  DB: D1Database;
  MEDIA: R2Bucket;
  ASSETS: Fetcher;
  ADMIN_USER?: string;
  SITE_URL?: string;
  ADMIN_PASSWORD: string;
  SESSION_SECRET: string;
  RESEND_API_KEY?: string; // the mail service key for the enquiry emails (see src/lib/mail.ts)
  MAIL_FROM?: string; // the sender of those emails
}
