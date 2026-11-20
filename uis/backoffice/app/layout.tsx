import type { Metadata } from "next";
import { SessionGuard } from "@/components/SessionGuard";
import "./globals.css";

export const metadata: Metadata = {
  title: "HealthCore | Análisis de incidencias",
  description: "Análisis interno de incidencias operativas HealthCore.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body><SessionGuard>{children}</SessionGuard></body>
    </html>
  );
}
