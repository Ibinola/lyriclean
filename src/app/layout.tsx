import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/Toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "lyriclean — Clean Lyrics, Clear Worship",
  description:
    "Turn raw song lyrics into presentation-ready slides. Free, open-source lyric preparation tool for worship teams.",
  openGraph: {
    title: "lyriclean — Clean Lyrics, Clear Worship",
    description:
      "Turn raw song lyrics into presentation-ready slides. Free, open-source lyric preparation tool for worship teams.",
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
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.toggle("dark",localStorage.getItem("lyriclean:darkMode")==="dark"||(!localStorage.getItem("lyriclean:darkMode")&&window.matchMedia("(prefers-color-scheme:dark)").matches))`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ErrorBoundary>
          <ToastProvider>{children}</ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
