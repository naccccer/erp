import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";
import { WebShellLayout } from "../src/modules/shell/components/web-shell-layout";

export const metadata: Metadata = {
  title: "وب اپ ERP",
  description: "پوسته وب ERP",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <WebShellLayout>{children}</WebShellLayout>
      </body>
    </html>
  );
}
