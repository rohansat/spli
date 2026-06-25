'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { PublicNav } from '@/components/layout/PublicNav';

interface NavbarProps {
  userInitials?: string;
  userImage?: string;
}

export function Navbar({ userInitials = 'U', userImage }: NavbarProps) {
  const pathname = usePathname();
  const isPublicPage = pathname === '/' || pathname === '/company';

  if (isPublicPage) {
    return <PublicNav transparent />;
  }

  return (
    <nav className="fixed z-50 w-full border-b border-white/10 bg-black">
      <div className="space-container flex h-16 items-center justify-between">
        <Link href="/dashboard" className="text-lg font-bold tracking-wider text-white">
          SPACE PORTAL
        </Link>
        <div className="flex items-center space-x-6">
          <Link
            href="/dashboard"
            className={cn(
              'text-sm font-medium text-white/80 transition-colors hover:text-white',
              pathname === '/dashboard' && 'text-white'
            )}
          >
            DASHBOARD
          </Link>
          <Link
            href="/documents"
            className={cn(
              'text-sm font-medium text-white/80 transition-colors hover:text-white',
              pathname === '/documents' && 'text-white'
            )}
          >
            DOCUMENTS
          </Link>
          <Link
            href="/messages"
            className={cn(
              'text-sm font-medium text-white/80 transition-colors hover:text-white',
              pathname === '/messages' && 'text-white'
            )}
          >
            MESSAGES
          </Link>
        </div>
      </div>
    </nav>
  );
}

interface NavLinkProps {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
}

function NavLink({ href, isActive, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'relative px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white',
        isActive &&
          'text-white after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-white'
      )}
    >
      {children}
    </Link>
  );
}
