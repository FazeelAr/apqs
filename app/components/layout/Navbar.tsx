'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  Calendar,
  Trophy,
  Users,
  Zap,
  PlusCircle,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  ChevronDown,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { createClient } from '../../lib/supabase/client';
import type { User } from '@supabase/supabase-js';

const navLinks = [
  { href: '/', label: 'Home', icon: Zap },
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/calendar', label: 'Schedule', icon: Calendar },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/about', label: 'About', icon: Users },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const supabase = createClient();

      // Get initial user
      supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user);
      });

      // Listen for auth state changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch {
      // Gracefully continue if Supabase is not yet configured
    }
  }, []);

  // Close user dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setUser(null);
      setUserMenuOpen(false);
      window.location.href = '/';
    } catch {
      window.location.href = '/';
    }
  };

  const userAvatar =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Member';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b border-header-border
        bg-header-bg backdrop-blur-xl transition-all duration-300"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 transition-opacity duration-200 hover:opacity-80"
          id="navbar-logo"
        >
          <Image
            src="/header_icon.jpeg"
            alt="All Pakistan Quiz Society"
            width={140}
            height={40}
            className="h-10 w-auto rounded"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex" id="desktop-nav">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative px-3 py-2 text-sm font-medium text-muted-foreground
                transition-colors duration-200 hover:text-foreground"
              id={`nav-link-${link.label.toLowerCase()}`}
            >
              {link.label}
              <span
                className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2
                  bg-primary transition-all duration-300 group-hover:w-full rounded-full"
              />
            </Link>
          ))}
        </nav>

        {/* Right side: Theme Toggle + Auth */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {user ? (
            /* User profile dropdown for desktop */
            <div className="relative hidden sm:block" ref={dropdownRef}>
              <button
                id="user-menu-button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 rounded-full border border-border/70 bg-surface-2 p-1 pr-3
                  text-foreground transition-all duration-200 hover:border-primary/50 hover:bg-surface-3 cursor-pointer"
              >
                {userAvatar ? (
                  <Image
                    src={userAvatar}
                    alt={userName}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover border border-primary/30"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                    {userInitial}
                  </div>
                )}
                <span className="text-xs font-medium max-w-[120px] truncate">
                  {userName}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-foreground-muted" />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-border bg-surface p-2 shadow-2xl backdrop-blur-xl animate-scale-in z-50"
                  id="user-dropdown-menu"
                >
                  <div className="px-3 py-2 border-b border-border/60">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {userName}
                    </p>
                    <p className="text-[11px] text-foreground-muted truncate">
                      {user.email}
                    </p>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-surface-2 transition-colors"
                    >
                      <UserIcon className="h-4 w-4 text-primary" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      href="/events/create"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-surface-2 transition-colors"
                    >
                      <PlusCircle className="h-4 w-4 text-accent" />
                      <span>Submit Event</span>
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-surface-2 transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4 text-primary-light" />
                      <span>Admin Dashboard</span>
                    </Link>
                  </div>

                  <div className="border-t border-border/60 pt-1">
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Sign in button */
            <Link
              href="/login"
              className="hidden rounded-lg bg-primary px-4 py-2 text-sm font-semibold
                text-primary-foreground transition-all duration-300
                hover:bg-primary-light hover:shadow-[0_0_20px_rgba(76,175,80,0.3)]
                active:scale-95 sm:inline-flex"
              id="navbar-login"
            >
              Sign In
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg
              bg-surface-2 text-foreground transition-all duration-200
              hover:bg-surface-3 md:hidden cursor-pointer"
            aria-label="Toggle menu"
            id="mobile-menu-toggle"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`overflow-hidden border-t border-header-border bg-header-bg
          backdrop-blur-xl transition-all duration-300 md:hidden
          ${mobileOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
        id="mobile-nav"
      >
        <nav className="flex flex-col gap-1 px-4 py-3">
          {navLinks.map((link) => {
            const IconComponent = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm
                  font-medium text-muted-foreground transition-all duration-200
                  hover:bg-surface-2 hover:text-foreground"
                id={`mobile-nav-${link.label.toLowerCase()}`}
              >
                <IconComponent className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}

          {user ? (
            <div className="mt-2 pt-2 border-t border-border/60 flex flex-col gap-1">
              <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-surface-2"
              >
                <UserIcon className="h-4 w-4 text-primary" />
                <span>My Profile ({userName})</span>
              </Link>
              <Link
                href="/events/create"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-surface-2"
              >
                <PlusCircle className="h-4 w-4 text-accent" />
                <span>Submit Event</span>
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-surface-2"
              >
                <LayoutDashboard className="h-4 w-4 text-primary-light" />
                <span>Admin Dashboard</span>
              </Link>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleSignOut();
                }}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="mt-2 flex items-center justify-center rounded-lg bg-primary
                px-4 py-2.5 text-sm font-semibold text-primary-foreground
                transition-all duration-300 hover:bg-primary-light"
              id="mobile-login"
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
