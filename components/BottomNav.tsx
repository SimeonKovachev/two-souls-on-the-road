"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  icon: string;
  label: string;
  matchPath?: string; // For matching chapter/* paths
}

const navItems: NavItem[] = [
  { href: "/", icon: "📖", label: "Home" },
  { href: "/new-chapter", icon: "✨", label: "New" },
  { href: "/map", icon: "🗺️", label: "Map" },
  { href: "/search", icon: "🔍", label: "Search" },
  { href: "/settings", icon: "⚙️", label: "Settings" },
];

export function BottomNav() {
  const pathname = usePathname();

  // Don't show on chapter pages (too much content)
  if (pathname?.startsWith("/chapter/")) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-cream/95 backdrop-blur-md border-t border-silver-light safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto px-2 py-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.matchPath && pathname?.startsWith(item.matchPath));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center py-2 px-4 rounded-lg
                transition-all min-w-[60px] min-h-[56px]
                ${isActive
                  ? "text-plum bg-moonlight"
                  : "text-midnight-soft hover:text-plum hover:bg-moonlight/50"
                }
              `}
            >
              <span className="text-xl mb-0.5">{item.icon}</span>
              <span className="text-xs font-display">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// Add padding to main content when nav is visible
export function BottomNavSpacer() {
  return <div className="h-20 md:h-0" />;
}
