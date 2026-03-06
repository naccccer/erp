import Link from "next/link";

type NavItem = {
  href: string;
  label: string;
  active?: boolean;
};

const navItems: NavItem[] = [
  { href: "/sales", label: "Sales", active: true },
  { href: "#", label: "Contacts" },
  { href: "#", label: "Products" },
  { href: "#", label: "Inventory" },
  { href: "#", label: "Finance" },
];

export function Sidebar() {
  return (
    <nav aria-label="Main navigation">
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
