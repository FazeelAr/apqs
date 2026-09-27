'use client';

import { useEffect, useRef, useState } from 'react';
import { Trophy, Calendar, Users, Award } from 'lucide-react';

interface StatsProps {
  initialStats?: {
    eventsHosted?: number;
    activeQuizzers?: number;
    championsCrowned?: number;
    citiesRepresented?: number;
  };
}

function AnimatedCounter({
  value,
  suffix,
  duration = 2000,
  inView,
}: {
  value: number;
  suffix: string;
  duration?: number;
  inView: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let start = 0;
    const step = Math.max(1, Math.ceil(value / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration, inView]);

  return (
    <span className="tabular-nums">
      {count}
      {suffix}
    </span>
  );
}

export default function StatsSection({ initialStats }: StatsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const stats = [
    {
      icon: Calendar,
      value: initialStats?.eventsHosted ?? 50,
      suffix: '+',
      label: 'Events Hosted',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: Users,
      value: initialStats?.activeQuizzers ?? 500,
      suffix: '+',
      label: 'Active Quizzers',
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
    {
      icon: Trophy,
      value: initialStats?.championsCrowned ?? 30,
      suffix: '+',
      label: 'Champions Crowned',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: Award,
      value: initialStats?.citiesRepresented ?? 15,
      suffix: '+',
      label: 'Cities & Regions',
      color: 'text-primary-lighter',
      bgColor: 'bg-primary-lighter/10',
    },
  ];

  return (
    <section
      ref={ref}
      className="relative border-y border-border bg-surface-1 py-16"
      id="stats-section"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={stat.label}
                className="group flex flex-col items-center gap-3 rounded-2xl border
                  border-border bg-card p-6 text-center transition-all duration-500
                  hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5
                  hover:-translate-y-1"
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? 'translateY(0)' : 'translateY(20px)',
                  transition: `all 0.6s ease ${index * 0.1}s`,
                }}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bgColor}
                    transition-transform duration-300 group-hover:scale-110`}
                >
                  <IconComponent className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
                  <AnimatedCounter
                    value={stat.value}
                    suffix={stat.suffix}
                    inView={inView}
                  />
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
