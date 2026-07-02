import type { Metadata } from "next";
import { Caveat, Fraunces, Newsreader, Space_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["700", "900"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Books & Brews Silver Jubilee Wall of Fame",
  description:
    "Celebrate the Silver Jubilee Edition. Registered attendees can claim their place on the Books & Brews Wall of Fame.",
  openGraph: {
    title: "Books & Brews Silver Jubilee Wall of Fame",
    description:
      "Celebrate the Silver Jubilee Edition. Registered attendees can claim their place on the Books & Brews Wall of Fame.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${caveat.variable} ${newsreader.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-wall text-cream">
        {children}
      </body>
    </html>
  );
}
