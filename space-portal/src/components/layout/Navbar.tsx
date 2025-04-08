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

  // Hide navigation on sign in/up pages
  if (pathname === '/signin' || pathname === '/signup') {
    return null;
  }

  // Check if we're on a public page
  const isPublicPage = pathname === '/' || pathname === '/company';

  // Show public navigation
  if (isPublicPage) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="text-white text-xl font-bold">
              SPLI
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center space-x-8">
              <Link
                href="/"
                className={cn(
                  "text-sm text-white uppercase hover:text-gray-300 transition-colors",
                  pathname === "/" && "font-medium"
                )}
              >
                HOME
              </Link>
              <Link
                href="/company"
                className={cn(
                  "text-sm text-white uppercase hover:text-gray-300 transition-colors",
                  pathname === "/company" && "font-medium"
                )}
              >
                COMPANY
              </Link>
              <Link
                href="/signin"
                className={cn(
                  "text-sm text-white uppercase hover:text-gray-300 transition-colors",
                  pathname?.startsWith("/signin") && "font-medium"
                )}
              >
                LOG IN
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Show dashboard navigation for authenticated routes
  return (
    <nav className="fixed w-full z-50 bg-black border-b border-white/10">
      <div className="space-container flex items-center justify-between h-16">
        <div className="flex items-center space-x-8">
          <Link href="/dashboard" className="text-white text-lg font-bold tracking-wider">
            SPACE PORTAL
          </Link>

          <div className="hidden md:flex space-x-6">
            <NavLink href="/dashboard" isActive={pathname === '/dashboard'}>
              HOME
            </NavLink>
            <NavLink href="/documents" isActive={pathname.startsWith('/documents')}>
              DOCUMENT MANAGEMENT
            </NavLink>
            <NavLink href="/messages" isActive={pathname.startsWith('/messages')}>
              MESSAGES
            </NavLink>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="focus:outline-none">
                <Avatar className="h-8 w-8 transition-opacity hover:opacity-80">
                  {userImage ? (
                    <AvatarImage src={userImage} alt="User" />
                  ) : null}
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <Link href="/" passHref>
                <DropdownMenuItem className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
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
