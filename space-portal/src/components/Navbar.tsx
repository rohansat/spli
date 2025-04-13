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
import { useAuth } from "@/lib/auth-context";
import { PublicNav } from "./PublicNav";

export function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const navigation = [
    { name: "HOME", href: "/dashboard" },
    { name: "DOCUMENT MANAGEMENT", href: "/documents" },
    { name: "MESSAGES", href: "/messages" },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-zinc-800">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-white text-xl font-bold">
            SPLI
          </Link>
          <nav className="flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-[15px] font-medium",
                  pathname === item.href ? "text-white" : "text-zinc-400"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            {!user ? (
              <PublicNav />
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 rounded-full bg-zinc-800 p-0 text-white"
                  >
                    <span className="sr-only">Open user menu</span>
                    {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-[#1A1A1A] border border-zinc-800 text-white"
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">My Account</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem className="flex items-center gap-2 text-zinc-400 focus:bg-[#111111] focus:text-white cursor-pointer">
                    <User className="h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 text-zinc-400 focus:bg-[#111111] focus:text-white cursor-pointer">
                    <Settings className="h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem 
                    className="flex items-center gap-2 text-zinc-400 focus:bg-[#111111] focus:text-white cursor-pointer"
                    onClick={async (e) => {
                      e.preventDefault();
                      await signOut();
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 