"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CheckSquare,
  Calendar,
  FolderOpen,
  Brain,
  Users,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/projects", label: "Projects", icon: FolderOpen },
  { href: "/memory", label: "Memory", icon: Brain },
  { href: "/team", label: "Team", icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[200px] min-h-screen flex-shrink-0 flex flex-col border-r border-mc-border bg-mc-base">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <div className="text-white font-bold text-sm tracking-[0.2em] uppercase leading-tight">
          MISSION
          <br />
          CONTROL
        </div>
      </div>

      {/* Active agent */}
      <div className="px-5 pb-5">
        <div className="flex items-center gap-2.5 p-3 rounded bg-mc-card border border-mc-border">
          <div className="text-xl leading-none">🐝</div>
          <div className="min-w-0">
            <div className="text-xs font-mono text-white font-semibold truncate">
              Maduso
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-mc-green inline-block" />
              <span className="text-[10px] font-mono text-mc-green tracking-wider">
                ONLINE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 mb-4 border-t border-mc-border" />

      {/* Nav */}
      <nav className="flex-1 px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm mb-0.5 transition-colors ${
                active
                  ? "bg-mc-blue/10 text-mc-blue border-l-2 border-mc-blue pl-[10px]"
                  : "text-mc-muted hover:text-white hover:bg-mc-card border-l-2 border-transparent pl-[10px]"
              }`}
            >
              <Icon
                size={15}
                className={active ? "text-mc-blue" : "text-mc-muted"}
              />
              <span className={active ? "font-medium" : ""}>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 pb-5 mt-auto">
        <div className="text-[10px] font-mono text-mc-subtle tracking-wider">
          v0.1.0
        </div>
      </div>
    </aside>
  );
}
