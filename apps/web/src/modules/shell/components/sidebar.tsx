import Link from "next/link";

type NavItem = {
  href: string;
  label: string;
  active?: boolean;
};

const navItems: NavItem[] = [
  { href: "/sales", label: "فروش", active: true },
  { href: "#", label: "مخاطبین" },
  { href: "#", label: "کالاها" },
  { href: "#", label: "انبار" },
  { href: "#", label: "مالی" },
];

export function Sidebar() {
  return (
    <nav aria-label="ناوبری اصلی">
      <h1 className="shell-brand">ERP</h1>
      <div className="shell-nav">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`shell-nav__item ${item.active ? "shell-nav__item--active" : ""}`.trim()}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
