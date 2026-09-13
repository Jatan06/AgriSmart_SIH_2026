import { Manrope, Lora } from "next/font/google";
import "./globals.css";
import { ReactLenis } from 'lenis/react';

const manrope = Manrope({ 
  subsets: ["latin"],
  variable: '--font-sans',
});

const lora = Lora({ 
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
  variable: '--font-heading',
});

export const metadata = {
  title: "AgriSmart AI | Instant Crop Diagnosis",
  description: "Upload a leaf photo and get an AI-powered disease diagnosis with actionable treatment plans in seconds.",
};

import Navbar from "@/components/Navbar";

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${lora.variable} antialiased`}
    >
      <body className="flex flex-col font-sans">
        <ReactLenis root>
          <Navbar />
          {children}
        </ReactLenis>
      </body>
    </html>
  );
}
