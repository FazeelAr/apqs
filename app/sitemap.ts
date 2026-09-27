import type { MetadataRoute } from 'next';
import { prisma } from './lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://apqs.pk';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/calendar`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  try {
    const events = await prisma.event.findMany({
      where: { status: { in: ['approved', 'concluded'] } },
      select: { id: true, slug: true, updatedAt: true },
      take: 100,
    });

    const eventRoutes: MetadataRoute.Sitemap = events.map((event) => ({
      url: `${baseUrl}/events/${event.slug || event.id}`,
      lastModified: event.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    return [...staticRoutes, ...eventRoutes];
  } catch {
    return staticRoutes;
  }
}
