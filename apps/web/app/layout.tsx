import type { Metadata } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";

import "./globals.css";
import { WebShellLayout } from "../src/modules/shell/components/web-shell-layout";

const vazirmatn = localFont({
  src: [
    { path: "./fonts/vazirmatn/Vazirmatn-Thin.woff2", weight: "100", style: "normal" },
    { path: "./fonts/vazirmatn/Vazirmatn-ExtraLight.woff2", weight: "200", style: "normal" },
    { path: "./fonts/vazirmatn/Vazirmatn-Light.woff2", weight: "300", style: "normal" },
    { path: "./fonts/vazirmatn/Vazirmatn-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/vazirmatn/Vazirmatn-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/vazirmatn/Vazirmatn-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/vazirmatn/Vazirmatn-Bold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/vazirmatn/Vazirmatn-ExtraBold.woff2", weight: "800", style: "normal" },
    { path: "./fonts/vazirmatn/Vazirmatn-Black.woff2", weight: "900", style: "normal" }
  ],
  variable: "--font-vazirmatn",
  display: "swap"
});

export const metadata: Metadata = {
  title: "وب اپ ERP",
  description: "پوسته وب ERP"
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="fa" dir="rtl">
      <body className={vazirmatn.variable}>
        <WebShellLayout>{children}</WebShellLayout>
      </body>
    </html>
  );
}
