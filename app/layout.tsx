import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const body = Instrument_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "ClipForge",
  description: "Drop one video, get captioned vertical shorts.",
};

// Runs before paint so a saved light theme never flashes dark. Dark needs no attribute.
const themeScript = `try{var d=document.documentElement;if(localStorage.getItem("clipforge-theme")==="light")d.dataset.theme="light";var l=localStorage.getItem("clipforge-lang")||(navigator.language||"en").slice(0,2);d.lang=["pt","es"].includes(l)?l:"en"}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
