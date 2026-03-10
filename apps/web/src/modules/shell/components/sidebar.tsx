'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = {
  href: string;
  label: string;
};

const navItems: NavItem[] = [
  { href: '/sales', label: 'فروش' },
  { href: '/purchasing', label: 'خرید' },
  { href: '/inventory', label: 'انبار' },
  { href: '/finance', label: 'مالی' },
];

function isItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav aria-label="ناوبری اصلی">
      <h1 className="shell-brand">ERP</h1>
      <div className="shell-nav">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`shell-nav__item ${isItemActive(pathname, item.href) ? 'shell-nav__item--active' : ''}`.trim()}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
