import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tanuki — Office Lunches. Actually Good.",
  description: "Des lunch boxes végétales livrées à vélo dans les bureaux bruxellois.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <body className="min-h-full flex flex-col" style={{ backgroundColor: "var(--paper)", color: "var(--black)" }}>
        {children}
      </body>
    </html>
  );
}
