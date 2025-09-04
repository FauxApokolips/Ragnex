// src/app/layout.tsx
import "./globals.css";          // ⬅️ add this line
import { AuthProvider } from "@/lib/auth";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-zinc-100">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
