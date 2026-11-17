import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pagentary | Official Pageant Voting Portal",
  description:
    "Discover pageant contestants and support your favourite. The official Pagentary online voting platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
