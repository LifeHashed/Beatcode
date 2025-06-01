'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Logo } from '@/components/ui/logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User,
  LogOut,
  Settings,
  Shield,
  Menu,
  Code,
  Trophy,
  BarChart,
  Users,
  Home,
  BookOpen,
  MessageSquare,
  TrendingUp,
  Feedback, // Add this import
} from 'lucide-react';
import { ProfileModal } from '@/components/profile/profile-modal';
import { FeedbackButton } from '@/components/feedback/feedback-button'; // Add this import

export function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getDashboardLink = () => {
    if (session?.user?.role === 'SUPER_ADMIN') {
      return '/dashboard/super-admin';
    }
    if (session?.user?.role === 'ADMIN') {
      return '/dashboard/admin';
    }
    return '/dashboard/user';
  };

  const navigationItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'Progress', href: '/progress', icon: BarChart },
  ];

  // Add Dashboard link for authenticated users
  const userNavigation = session ? [
    { 
      name: session?.user?.role === 'SUPER_ADMIN' ? 'Maintenance and Management' : 
           session?.user?.role === 'ADMIN' ? 'Website Management' : 'Dashboard', 
      href: getDashboardLink(), 
      icon: Home 
    },
    ...(session?.user?.role === 'USER' ? [
      { name: 'Problems', href: '/dashboard/user/problems', icon: Code },
    ] : []),
  ] : navigationItems;

  const adminNavigation = [];

  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';

  const isActive = (href: string) => {
    return pathname === href;
  };

  const shouldShowFeedbackButton = () => {
    // Hide feedback button for all authenticated users
    if (session?.user) {
      return false;
    }
    return true;
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Admin';
      case 'ADMIN': return 'Admin';
      case 'USER': return 'User';
      default: return 'Guest';
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'destructive';
      case 'ADMIN': return 'secondary';
      case 'USER': return 'outline';
      default: return 'outline';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          {/* Brand */}
          <Link href="/" className="mr-6">
            <span className="font-bold text-2xl text-foreground">BeatCode</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:flex-1 md:items-center md:justify-between">
            <div className="flex items-center space-x-6">
              {/* Show different navigation based on authentication */}
              {session ? (
                <>
                  {userNavigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-foreground ${
                          isActive(item.href) ? 'text-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                  {isAdmin && (
                    <>
                      {adminNavigation.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-foreground ${
                              isActive(item.href) ? 'text-foreground' : 'text-muted-foreground'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}
                    </>
                  )}
                </>
              ) : (
                <>
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-foreground ${
                          isActive(item.href) ? 'text-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {shouldShowFeedbackButton() && <FeedbackButton variant="ghost" />}
              <ThemeToggle />
              
              {status === 'loading' ? (
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} />
                        <AvatarFallback>
                          {session.user?.name ? getInitials(session.user.name) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        {session.user?.name && (
                          <p className="font-medium">{session.user.name}</p>
                        )}
                        {session.user?.email && (
                          <p className="w-[200px] truncate text-sm text-muted-foreground">
                            {session.user.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsProfileModalOpen(true)}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" asChild>
                    <Link href="/auth/signin">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/auth/signup">Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="flex flex-1 items-center justify-end md:hidden">
            {shouldShowFeedbackButton() && <FeedbackButton variant="ghost" />}
            <ThemeToggle />
            
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" className="ml-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="pr-0 bg-background">
                <div className="flex flex-col space-y-3">
                  {/* Mobile Brand */}
                  <Link href="/" className="flex items-center" onClick={() => setIsOpen(false)}>
                    <span className="font-bold text-2xl text-foreground">BeatCode</span>
                  </Link>

                  {/* Mobile Navigation Links */}
                  <div className="flex flex-col space-y-2">
                    {session ? (
                      <>
                        {userNavigation.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.name}
                              href={item.href}
                              className={`flex items-center space-x-2 px-2 py-2 text-sm font-medium transition-colors hover:text-foreground ${
                                isActive(item.href) ? 'text-foreground' : 'text-muted-foreground'
                              }`}
                              onClick={() => setIsOpen(false)}
                            >
                              <Icon className="h-4 w-4" />
                              <span>{item.name}</span>
                            </Link>
                          );
                        })}
                        
                        {isAdmin && (
                          <>
                            <div className="my-2 border-t" />
                            {adminNavigation.map((item) => {
                              const Icon = item.icon;
                              return (
                                <Link
                                  key={item.name}
                                  href={item.href}
                                  className={`flex items-center space-x-2 px-2 py-2 text-sm font-medium transition-colors hover:text-foreground ${
                                    isActive(item.href) ? 'text-foreground' : 'text-muted-foreground'
                                  }`}
                                  onClick={() => setIsOpen(false)}
                                >
                                  <Icon className="h-4 w-4" />
                                  <span>{item.name}</span>
                                </Link>
                              );
                            })}
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        {navigationItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.name}
                              href={item.href}
                              className={`flex items-center space-x-2 px-2 py-2 text-sm font-medium transition-colors hover:text-foreground ${
                                isActive(item.href) ? 'text-foreground' : 'text-muted-foreground'
                              }`}
                              onClick={() => setIsOpen(false)}
                            >
                              <Icon className="h-4 w-4" />
                              <span>{item.name}</span>
                            </Link>
                          );
                        })}
                      </>
                    )}
                  </div>

                  {/* Mobile User Section */}
                  {session ? (
                    <div className="flex flex-col space-y-2 border-t pt-4">
                      <div className="flex items-center space-x-2 px-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} />
                          <AvatarFallback>
                            {session.user?.name ? getInitials(session.user.name) : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <p className="text-sm font-medium">{session.user?.name}</p>
                          <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                          <p className="text-xs text-muted-foreground">Role: {session.user?.role}</p>
                        </div>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center space-x-2 px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        onClick={() => setIsOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsOpen(false);
                        }}
                        className="flex items-center space-x-2 px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Log out</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-2 border-t pt-4">
                      <Button variant="ghost" asChild>
                        <Link href="/auth/signin" onClick={() => setIsOpen(false)}>
                          Sign In
                        </Link>
                      </Button>
                      <Button asChild>
                        <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                          Sign Up
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Profile Modal */}
      <ProfileModal 
        open={isProfileModalOpen} 
        onOpenChange={setIsProfileModalOpen}
      />
    </>
  );
}
