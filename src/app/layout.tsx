import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { Navigation } from "./_components/navigation";
import { auth } from "~/server/auth";

export const metadata: Metadata = {
  title: "QSLX - Ham Radio Contact Logger",
  description: "Modern, lightweight ham radio contact logging and visualization",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <TRPCReactProvider>
          {session?.user && <Navigation />}
          {children}
        </TRPCReactProvider>
      </body>
    </html>
  );
}
