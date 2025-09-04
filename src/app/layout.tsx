import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-black text-zinc-100">
        <AuthProvider>
          <LogoutButton /> 
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
