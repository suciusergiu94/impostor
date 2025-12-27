import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Impostor Game",
  description: "Local network party game",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={cn(inter.className, "min-h-screen bg-zinc-950 text-white")}>
        <main className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="w-full max-w-md space-y-8 relative">
            {/* Background blobs for premium feel */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[100px] animate-pulse" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
