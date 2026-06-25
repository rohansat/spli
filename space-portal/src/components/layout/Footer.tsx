import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const productLinks = [
    { href: '/', label: 'Home' },
    { href: '/company', label: 'Company' },
    { href: '/signin', label: 'Log in' },
  ];

  const legalLinks = [
    { href: '/privacy', label: 'PRIVACY POLICY' },
    { href: '/terms', label: 'TERMS OF SERVICE' },
    { href: '/compliance', label: 'COMPLIANCE' },
    { href: '/contact', label: 'CONTACT' },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-black py-12 text-white/50">
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-white">SPLI</p>
            <p className="mt-6 text-sm text-white/50">SPLI © {currentYear}</p>
          </div>

          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-white/35">
              Product
            </p>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-white/35">
              Legal
            </p>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
