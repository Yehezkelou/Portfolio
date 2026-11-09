import type { Metadata, Viewport } from "next";
import { meta } from "@/lib/content";
import { BottomBar } from "@/components/BottomBar";
import "./globals.css";

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  openGraph: {
    type: "website",
    locale: meta.locale,
    title: meta.title,
    description: meta.description,
    images: [{ url: meta.ogImage, width: 1200, height: 630, alt: meta.title }],
  },
  twitter: {
    card: "summary_large_image",
    title: meta.title,
    description: meta.description,
    images: [meta.ogImage],
  },
};

export const viewport: Viewport = {
  themeColor: "#f8f8ee",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="grain">
        <a className="skip-link" href="#main">
          Aller au contenu principal
        </a>
        <BottomBar />
        {children}
      </body>
    </html>
  );
}
