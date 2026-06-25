'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface PublicNavProps {
  transparent?: boolean;
}

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/company', label: 'Company' },
];

export function PublicNav({ transparent = false }: PublicNavProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const shellClass = transparent && !scrolled
    ? 'border-white/10 bg-black/45'
    : 'border-white/10 bg-black/70 shadow-lg shadow-black/30';

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 px-4 pb-2 pt-[calc(0.875rem+env(safe-area-inset-top,0px))] sm:px-6 lg:px-8">
      <div
        className={`mx-auto flex max-w-4xl items-center justify-between gap-3 rounded-full border px-4 py-2.5 backdrop-blur-md transition-all duration-300 supports-[backdrop-filter]:backdrop-blur-md sm:px-6 ${shellClass}`}
      >
        <Link
          href="/"
          className="shrink-0 text-sm font-bold uppercase tracking-[0.18em] text-white"
        >
          SPLI
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href ? 'text-white' : 'text-white/55 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/signin"
            className="hidden rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition-colors hover:bg-white/90 sm:inline-flex"
          >
            Log in
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {menuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mx-auto mt-2 max-w-4xl rounded-2xl border border-white/10 bg-black/90 p-3 backdrop-blur-md lg:hidden">
          <div className="flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-4 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/[0.04] hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/signin"
              className="mt-2 rounded-full bg-white px-4 py-3 text-center text-sm font-semibold text-black"
            >
              Log in
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
