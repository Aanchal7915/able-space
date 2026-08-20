import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import "./globals.css";
import { AccentProvider } from "@/lib/accent-provider";
import { AuthProvider } from "@/lib/auth-context";
import { SWRProvider } from "@/lib/swr-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AbleSpace | Task Management",
  description: "Task management workspace — assessment build for AbleSpace.",
};

const NO_FLASH_SCRIPT = `
(function () {
  try {
    var theme = localStorage.getItem('ablespace-theme') || 'light';
    var accent = localStorage.getItem('ablespace-accent') || 'blue';
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.setAttribute('data-accent', accent);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          storageKey="ablespace-theme"
        >
          <AccentProvider>
            <AuthProvider>
              <SWRProvider>{children}</SWRProvider>
            </AuthProvider>
          </AccentProvider>
        </ThemeProvider>
        <Toaster position="bottom-right" richColors closeButton theme="system" />
      </body>
    </html>
  );
}
