import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'optional',
  adjustFontFallback: false
});

export const metadata: Metadata = {
  title: "Parent Portal - Psychology Buddy",
  description: "Parent dashboard for monitoring child's mental health and progress",
};

export default function ParentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={inter.className}>
      {children}
    </div>
  );
}

