'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function HeroSection() {
  return (
    <section
      className="relative overflow-hidden min-h-[85vh] flex items-center"
      id="hero-section"
    >
      {/* Animated gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 20% 50%, rgba(27, 94, 32, 0.15) 0%, transparent 50%), ' +
            'radial-gradient(ellipse at 80% 20%, rgba(76, 175, 80, 0.1) 0%, transparent 50%), ' +
            'radial-gradient(ellipse at 50% 80%, rgba(255, 214, 0, 0.05) 0%, transparent 50%)',
        }}
      />

      {/* Floating orbs */}
      <div
        className="absolute top-20 left-[10%] h-72 w-72 rounded-full opacity-20 animate-float"
        style={{
          background:
            'radial-gradient(circle, rgba(76, 175, 80, 0.4) 0%, transparent 70%)',
          animationDelay: '0s',
        }}
      />
      <div
        className="absolute bottom-20 right-[15%] h-96 w-96 rounded-full opacity-15 animate-float"
        style={{
          background:
            'radial-gradient(circle, rgba(27, 94, 32, 0.3) 0%, transparent 70%)',
          animationDelay: '1.5s',
        }}
      />
      <div
        className="absolute top-[40%] right-[30%] h-48 w-48 rounded-full opacity-10 animate-float"
        style={{
          background:
            'radial-gradient(circle, rgba(255, 214, 0, 0.4) 0%, transparent 70%)',
          animationDelay: '3s',
        }}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">
          {/* Text content */}
          <div className="flex-1 text-center lg:text-left animate-fade-in-up">
            {/* Badge */}
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-glass-border
                bg-glass-bg px-4 py-1.5 text-xs font-medium text-primary backdrop-blur-sm"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Pakistan&apos;s Premier Quiz Community
            </div>

            <h1
              className="font-heading text-4xl font-extrabold leading-tight tracking-tight
                text-foreground sm:text-5xl lg:text-6xl xl:text-7xl"
            >
              Where{' '}
              <span
                className="bg-gradient-to-r from-primary via-primary-light to-primary-lighter
                  bg-clip-text text-transparent"
              >
                Brilliant
              </span>
              <br />
              Minds{' '}
              <span
                className="bg-gradient-to-r from-accent via-yellow-400 to-amber-500
                  bg-clip-text text-transparent"
              >
                Compete
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0 mx-auto">
              All Pakistan Quiz Society unites quizzers from every corner of the
              nation. Join our events, climb the leaderboard, and become the
              champion quizzer of the year.
            </p>

            {/* CTA buttons */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                href="/events"
                className="group inline-flex items-center justify-center gap-2 rounded-xl
                  bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground
                  transition-all duration-300 hover:bg-primary-light
                  hover:shadow-[0_0_30px_rgba(76,175,80,0.4)] active:scale-95"
                id="hero-cta-events"
              >
                Explore Events
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/leaderboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl
                  border border-border bg-glass-bg px-6 py-3 text-sm font-semibold
                  text-foreground backdrop-blur-sm transition-all duration-300
                  hover:border-primary hover:bg-surface-2 active:scale-95"
                id="hero-cta-leaderboard"
              >
                <Trophy className="h-4 w-4 text-accent" />
                View Leaderboard
              </Link>
            </div>
          </div>

          {/* Hero image / Logo */}
          <div
            className="relative flex flex-shrink-0 items-center justify-center
              animate-fade-in"
            style={{ animationDelay: '0.3s' }}
          >
            <div className="relative">
              {/* Glow ring behind logo */}
              <div
                className="absolute inset-0 rounded-full animate-pulse-glow"
                style={{
                  transform: 'scale(1.15)',
                  borderRadius: '50%',
                }}
              />
              <Image
                src="/tab_icon.jpeg"
                alt="APQS Logo"
                width={320}
                height={320}
                className="relative z-10 h-52 w-52 rounded-full object-cover shadow-2xl
                  ring-4 ring-primary/30 sm:h-64 sm:w-64 lg:h-80 lg:w-80"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Trophy({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}
