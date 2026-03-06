import type { ReactNode } from "react";

import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

type WebShellLayoutProps = {
  children: ReactNode;
};

export function WebShellLayout({ children }: WebShellLayoutProps) {
  return (
    <div className="web-shell">
      <aside className="web-shell__sidebar">
        <Sidebar />
      </aside>
      <div className="web-shell__main">
        <header className="web-shell__topbar">
          <Topbar />
        </header>
        <main className="web-shell__content">{children}</main>
      </div>
    </div>
  );
}
