import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";
import { WebShellLayout } from "../src/modules/shell/components/web-shell-layout";

export const metadata: Metadata = {
  title: "ERP Web",
  description: "ERP web shell",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <WebShellLayout>{children}</WebShellLayout>
      </body>
    </html>
  );
}
