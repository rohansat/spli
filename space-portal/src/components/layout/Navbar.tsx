'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogOut, User, Settings } from 'lucide-react';

interface NavbarProps {
  userInitials?: string;
  userImage?: string;
}

export function Navbar({ userInitials = 'U', userImage }: NavbarProps) {
  const pathname = usePathname();

  // Check if we're on a public page
  const isPublicPage = pathname === '/' || pathname === '/company';

  // Show public navigation
  if (isPublicPage) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 p-6 bg-black">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-white text-xl font-bold tracking-wider">
            SPLI
          </Link>
          <div className="flex space-x-6 items-center">
            <Link
              href="/"
              className="text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              HOME
            </Link>
            <Link
              href="/company"
              className="text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              COMPANY
            </Link>
            <Link
              href="/demo"
              className="text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              DEMO
            </Link>

            <Link
              href="/signin"
              className="text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              LOG IN
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  // Show dashboard navigation for authenticated routes
  return (
    <nav className="fixed w-full z-50 bg-black border-b border-white/10">
      <div className="space-container flex items-center justify-between h-16">
        <Link href="/dashboard" className="text-white text-lg font-bold tracking-wider">
          SPACE PORTAL
        </Link>
        <div className="flex items-center space-x-6">
          <Link
            href="/dashboard"
            className={cn(
              "text-sm font-medium text-white/80 hover:text-white transition-colors",
              pathname === '/dashboard' && "text-white"
            )}
          >
            DASHBOARD
          </Link>
          <Link
            href="/documents"
            className={cn(
              "text-sm font-medium text-white/80 hover:text-white transition-colors",
              pathname === '/documents' && "text-white"
            )}
          >
            DOCUMENTS
          </Link>
          <Link
            href="/messages"
            className={cn(
              "text-sm font-medium text-white/80 hover:text-white transition-colors",
              pathname === '/messages' && "text-white"
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
        "text-sm font-medium relative px-3 py-2 text-white/70 hover:text-white transition-colors",
        isActive && "text-white after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-white"
      )}
    >
      {children}
    </Link>
  );
}
