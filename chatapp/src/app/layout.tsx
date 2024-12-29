import type { Metadata } from "next";
 import "./globals.css";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProfileProvider } from "./contexts/CompleteProfileContext";

 
export const metadata: Metadata = {
  title: "Hey! - Social Media App by JeiiiMarcs",
  description: "Skibidis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
       >
        <ThemeProvider>
        <ProfileProvider>
          {children}
          </ProfileProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
