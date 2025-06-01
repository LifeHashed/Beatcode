'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Code } from 'lucide-react';
import { cn } from '@/lib/utils';

export function GuestNavbar() {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/guest/dashboard',
    },
    {
      label: 'Problems',
      href: '/guest/problems',
    },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/guest/dashboard" className="flex items-center space-x-2">
            <Code className="h-6 w-6" />
            <span className="text-xl font-bold">BeatCode</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button asChild variant="ghost">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/register">Sign Up</Link>
            </Button>
          </div>

          {/* Mobile menu button - implement if needed */}
          <div className="md:hidden">
            {/* Add mobile menu implementation here if needed */}
          </div>
        </div>
      </div>
    </nav>
  );
}
