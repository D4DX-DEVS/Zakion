import { Rajdhani, Rubik } from "next/font/google";

export const metadata = {
  title: "Zakion Admin",
  robots: { index: false },
  icons: { icon: [{ url: "/favicon.ico", sizes: "32x32" }, { url: "/icon-192.png", type: "image/png", sizes: "192x192" }], apple: "/apple-touch-icon.png" },
};

const head = Rajdhani({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-rajdhani", display: "swap" });
const body = Rubik({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-rubik", display: "swap" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${head.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
