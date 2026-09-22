import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Search, Activity, BookOpen, Terminal } from "lucide-react";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const primaryNavItems = [
    { label: "Overview", href: "/" },
    { label: "Markets", href: "/markets" },
    { label: "Analytics", href: "/analytics" },
    { label: "Activity", href: "/activity" },
    { label: "Events", href: "/events" },
    { label: "Lend", href: "/lend" },
  ];

  const secondaryNavItems = [
    { label: "Developers", href: "/developers", icon: <Terminal className="w-4 h-4" /> },
    { label: "Methodology", href: "/methodology", icon: <BookOpen className="w-4 h-4" /> },
    { label: "Status", href: "/status", icon: <Activity className="w-4 h-4" /> },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-text-primary hover:text-white transition-colors group"
          >
            <span className="font-mono font-black text-xl sm:text-2xl text-white tracking-tighter shrink-0 select-none">
              {'{D}'}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-base tracking-tight font-sans">
                <span className="font-normal text-text-secondary">dream</span>
                <span className="font-extrabold text-white">DEX</span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-sm bg-surface-2 border border-border text-text-muted font-medium">
                Analytics
              </span>
            </div>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-1">
          {primaryNavItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`px-3 py-1.5 text-sm font-sans font-medium rounded transition-colors ${
                  active
                    ? "bg-surface-2 text-text-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-1"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs">
            {secondaryNavItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`px-2.5 py-1.5 font-sans rounded-sm transition-colors ${
                  isActive(item.href)
                    ? "text-text-primary bg-surface-2"
                    : "text-text-muted hover:text-text-secondary hover:bg-surface-1"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <Link
            to="/markets"
            className="inline-flex items-center justify-center w-8 h-8 rounded-sm border border-border text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
            aria-label="Search markets"
          >
            <Search className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded border border-border text-text-secondary hover:text-text-primary hover:bg-surface-2"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-surface-1 px-4 py-6 space-y-6">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-text-faint mb-2">
              Core Analytics
            </div>
            <nav className="flex flex-col space-y-1">
              {primaryNavItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 text-sm font-sans font-medium rounded ${
                    isActive(item.href)
                      ? "bg-surface-3 text-text-primary"
                      : "text-text-secondary hover:bg-surface-2"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="pt-4 border-t border-border-subtle">
            <div className="text-[11px] font-mono uppercase tracking-wider text-text-faint mb-2">
              Reference & System
            </div>
            <div className="grid grid-cols-2 gap-2">
              {secondaryNavItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded bg-surface-2 text-xs text-text-secondary hover:text-text-primary"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
