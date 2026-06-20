import "./globals.css";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/shared/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "Notezy",
  applicationName: "Notezy",
  description: "Think it. Notezy it.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/575d6b91-2f68-446b-a345-10eb04b8383f.png",
    shortcut: "/icons/575d6b91-2f68-446b-a345-10eb04b8383f.png",
    apple: "/icons/575d6b91-2f68-446b-a345-10eb04b8383f.png",
  },
  appleWebApp: {
    capable: true,
    title: "Notezy",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#8B6BEA",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
