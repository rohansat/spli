import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    {
      href: '/dashboard',
      label: 'Dashboard'
    },
    {
      href: '/applications',
      label: 'Applications'
    },
    {
      href: '/documents',
      label: 'Documents'
    },
    {
      href: '/messages',
      label: 'Messages'
    }
  ];

  return (
    <div className="w-64 bg-zinc-800 p-4">
      <nav className="space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "block px-4 py-2 text-sm font-medium text-white rounded-md transition-colors",
              pathname === link.href
                ? "bg-zinc-700"
                : "hover:bg-zinc-700"
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
} 