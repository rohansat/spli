"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User } from "lucide-react";
import { PublicNav } from "./PublicNav";
import { useSession, signOut } from 'next-auth/react';

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navigation = [
    { name: "HOME", href: "/dashboard" },
    { name: "DOCUMENT MANAGEMENT", href: "/documents" },
    { name: "MESSAGES", href: "/messages" },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-zinc-800">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-xl font-bold text-white tracking-widest">
            SPLI
          </Link>
          <nav className="hidden md:flex gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-white",
                  pathname === item.href ? "text-white" : "text-zinc-400"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {session && session.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 text-white">
                  <User className="h-5 w-5" />
                  <span>{session.user.name || session.user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center gap-2 text-zinc-400 focus:bg-[#111111] focus:text-white cursor-pointer" onClick={() => signOut()}>
                  <LogOut className="h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/signin" className="text-zinc-400 hover:text-white font-medium">Sign in</Link>
          )}
        </div>
      </div>
    </div>
  );
} 