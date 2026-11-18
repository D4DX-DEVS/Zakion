import { Rajdhani, Rubik } from "next/font/google";

export const metadata = {
  title: "Zakion Admin",
  robots: { index: false },
  icons: { icon: [{ url: "/favicon.ico", sizes: "32x32" }, { url: "/icon-192.png", type: "image/png", sizes: "192x192" }], apple: "/apple-touch-icon.png" },
};

const body = Rubik({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-rubik", display: "swap" });
// Rajdhani is the brand's heading font; the admin uses it for titles and numbers.
const head = Rajdhani({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-rajdhani", display: "swap" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={body.variable + " " + head.variable}>
      <body>{children}</body>
    </html>
  );
}
