import type { Metadata } from "next";
import { Poppins, Roboto } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import { TooltipProvider } from "@/components/ui/tooltip";
import Providers from "./providers/provider";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Datalyzer",
  description: "",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();

  const color = cookieStore.get("theme")?.value ?? "blue";
  const mode = cookieStore.get("mode")?.value ?? "light";
  const radius = cookieStore.get("theme-radius")?.value ?? "rounded";
  const themeClass = mode === "dark" ? `theme-${color}-dark` : `theme-${color}`;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${themeClass} ${radius === "rounded" ? "radius-rounded" : "radius-square"}`}
    >
      <body className={`${poppins.variable} ${roboto.variable} antialiased`}>
        <Providers>
          <TooltipProvider>{children}</TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
