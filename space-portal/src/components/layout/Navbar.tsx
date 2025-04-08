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

  // Show landing page navigation for public routes
  if (pathname === '/signin' || pathname === '/signup') {
    return null;
  }

  // Show public navigation for home and company pages
  if (pathname === '/' || pathname === '/company' || pathname === '/demo') {
    return (
      <nav className={cn(
        "fixed w-full z-50",
        pathname === '/company' ? "absolute bg-transparent" : "bg-black border-b border-white/10"
      )}>
        <div className="space-container flex items-center justify-between h-16">
          <Link href="/" className="text-white text-lg font-bold tracking-wider">
            SPLI
          </Link>

          <div className="flex items-center gap-6">
            <Link 
              href="/" 
              className={cn(
                "text-sm font-medium text-white/80 hover:text-white transition-colors",
                pathname === '/' && "text-white"
              )}
            >
              HOME
            </Link>
            <Link 
              href="/company" 
              className={cn(
                "text-sm font-medium text-white/80 hover:text-white transition-colors",
                pathname === '/company' && "text-white"
              )}
            >
              COMPANY
            </Link>
            <Link 
              href="/demo" 
              className={cn(
                "px-4 py-2 text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors",
                pathname === '/demo' && "bg-zinc-700"
              )}
            >
              DEMO
            </Link>
            <Link 
              href="/signin" 
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
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
        <div className="flex items-center space-x-8">
          <Link href={pathname === '/demo' ? '/demo' : '/dashboard'} className="text-white text-lg font-bold tracking-wider">
            SPACE PORTAL
          </Link>

          <div className="hidden md:flex space-x-6">
            <NavLink href={pathname === '/demo' ? '/demo' : '/dashboard'} isActive={pathname === '/dashboard' || pathname === '/demo'}>
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
