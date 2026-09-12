import { Playfair_Display, Outfit } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "AgriSmart AI — Instant Crop Disease Detection",
  description: "Upload a leaf photo and get an AI-powered disease diagnosis with actionable treatment plans in seconds.",
};

import { ReactLenis } from 'lenis/react';

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ReactLenis root>
          {children}
        </ReactLenis>
      </body>
    </html>
  );
}
