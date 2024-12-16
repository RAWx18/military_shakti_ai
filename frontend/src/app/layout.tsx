import { Metadata } from "next";
import localFont from "next/font/local";
import { Allerta_Stencil } from "next/font/google";
import { Electrolize } from "next/font/google";
import "./globals.css";
import { ThemeProviderWrapper } from '@/components/theme-provider-wrapper'; // Renamed for clarity
import { Toaster } from '@/components/ui/toaster';

// Import local fonts
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
const electrolize = Electrolize({
  weight: ["400"], // Specify the available weight, default is 400
  subsets: ["latin"], // Subsets for the font
  variable: "--font-electrolize", // CSS variable for global use
});

// Import Allerta Stencil font from Google Fonts
const allertaStencil = Allerta_Stencil({
  weight: ["400"], // Specify the weight if needed, default is 400
  subsets: ["latin"], // Specify the subsets (optional)
  variable: "--font-allerta-stencil", // This will be used to apply the font globally
});

export const metadata: Metadata = {
  title: "Shakti AI",
  description: "Shakti MultiModal LLM",
};



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${allertaStencil.variable} antialiased`}>
        {/* Wrap content with ThemeProviderWrapper */}
        <ThemeProviderWrapper>
          {children}
        </ThemeProviderWrapper>
        <Toaster />
      </body>
    </html>
  );
}
