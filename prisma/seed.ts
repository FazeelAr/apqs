import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting APQS database seed...');

  // 1. Create or upsert core Cabinet & Champion profiles
  const profilesData = [
    {
      fullName: 'Muhammad Hamza Khan',
      email: 'president@apqs.pk',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      role: 'president',
      city: 'Islamabad',
      university: 'National University of Sciences & Technology (NUST)',
      bio: 'National Quiz Champion 2024 & 2025. Avid history and geopolitics trivia enthusiast dedicated to elevating competitive quizzing across Pakistan.',
      isCabinet: true,
      cabinetPosition: 'President & Founder',
      cabinetOrder: 1,
    },
    {
      fullName: 'Ayesha Siddiqui',
      email: 'vp@apqs.pk',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      role: 'super_admin',
      city: 'Lahore',
      university: 'Lahore University of Management Sciences (LUMS)',
      bio: 'Head of National Quiz Circuit Operations. Specializes in science, literature, and art trivia bowl design.',
      isCabinet: true,
      cabinetPosition: 'Vice President & Head of Operations',
      cabinetOrder: 2,
    },
    {
      fullName: 'Bilal Ahmed Farooqi',
      email: 'bilal@apqs.pk',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      role: 'member',
      city: 'Karachi',
      university: 'Institute of Business Administration (IBA)',
      bio: 'General Secretary at APQS. Passionate about youth quiz tournaments and international trivia olympiads.',
      isCabinet: true,
      cabinetPosition: 'General Secretary',
      cabinetOrder: 3,
    },
    {
      fullName: 'Zainab Fatima',
      email: 'zainab@apqs.pk',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
      role: 'member',
      city: 'Peshawar',
      university: 'University of Engineering and Technology, Peshawar',
      bio: 'Director of Competitions. Curator for STEM and Current Affairs collegiate quiz tournaments.',
      isCabinet: true,
      cabinetPosition: 'Director of Competitions',
      cabinetOrder: 4,
    },
    {
      fullName: 'Omar Tariq',
      email: 'omar@apqs.pk',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      role: 'member',
      city: 'Rawalpindi',
      university: 'GIKI',
      bio: 'Two-time Runner Up in the National Circuit. Trivia researcher and question setter.',
      isCabinet: false,
      cabinetPosition: null,
      cabinetOrder: 999,
    },
  ];

  const createdProfiles: Record<string, string> = {};

  for (const p of profilesData) {
    const existing = await prisma.profile.findFirst({ where: { email: p.email } });
    if (existing) {
      createdProfiles[p.fullName] = existing.id;
      console.log(`✓ Existing profile: ${p.fullName}`);
    } else {
      const created = await prisma.profile.create({ data: p });
      createdProfiles[p.fullName] = created.id;
      console.log(`✓ Created profile: ${p.fullName} (${p.role})`);
    }
  }

  // 2. Create Events
  const eventsData = [
    {
      title: 'National Inter-University Quiz Championship 2026',
      slug: 'national-inter-university-quiz-championship-2026',
      description:
        'The apex annual quiz tournament of Pakistan featuring university delegations from Punjab, Sindh, KPK, Balochistan, and Islamabad competing across 6 intense preliminary, semi-final, and buzzer rounds.',
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80',
      registrationLink: 'https://forms.gle/apqs-national-2026',
      bookletPdfUrl: '',
      eventDate: new Date('2026-10-18T10:00:00Z'),
      eventTime: '10:00 AM - 05:00 PM PKT',
      venue: 'Jinnah Auditorium, NUST H-12, Islamabad',
      status: 'approved',
      createdBy: createdProfiles['Muhammad Hamza Khan'],
    },
    {
      title: 'LUMS Invitational Trivia & General Knowledge Bowl',
      slug: 'lums-invitational-trivia-bowl-2026',
      description:
        'Premier inter-collegiate quiz bowl showcasing high-stakes speed buzzer rounds in world geography, cinematic history, classical literature, and modern science.',
      imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80',
      registrationLink: 'https://lums.edu.pk/quiz-bowl-2026',
      bookletPdfUrl: '',
      eventDate: new Date('2026-11-05T09:30:00Z'),
      eventTime: '09:30 AM - 04:00 PM PKT',
      venue: 'Suleman Dawood School of Business, LUMS, Lahore',
      status: 'approved',
      createdBy: createdProfiles['Ayesha Siddiqui'],
    },
    {
      title: 'Karachi Open Collegiate Trivia Masters',
      slug: 'karachi-open-collegiate-trivia-masters-2026',
      description:
        'An open-to-all collegiate and youth trivia tournament bringing together top quizzing minds across Sindh with lucrative prizes and national ranking points.',
      imageUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1200&auto=format&fit=crop&q=80',
      registrationLink: 'https://iba.edu.pk/events/trivia-masters',
      bookletPdfUrl: '',
      eventDate: new Date('2026-11-22T14:00:00Z'),
      eventTime: '02:00 PM - 07:00 PM PKT',
      venue: 'Aman Tower Auditorium, IBA City Campus, Karachi',
      status: 'approved',
      createdBy: createdProfiles['Bilal Ahmed Farooqi'],
    },
    {
      title: 'All Pakistan Autumn Heritage & History Quizathon',
      slug: 'all-pakistan-autumn-heritage-quizathon',
      description:
        'A celebrated showcase tournament testing in-depth mastery of South Asian heritage, Islamic civilizations, and global political history.',
      imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&auto=format&fit=crop&q=80',
      registrationLink: '',
      bookletPdfUrl: '',
      eventDate: new Date('2026-08-15T11:00:00Z'),
      eventTime: '11:00 AM - 04:00 PM PKT',
      venue: 'Alhamra Arts Council, Hall 2, Lahore',
      status: 'concluded',
      createdBy: createdProfiles['Ayesha Siddiqui'],
    },
  ];

  for (const ev of eventsData) {
    const existing = await prisma.event.findFirst({ where: { slug: ev.slug } });
    if (existing) {
      console.log(`✓ Existing event: ${ev.title}`);
    } else {
      const createdEvent = await prisma.event.create({ data: ev });
      console.log(`✓ Created event: ${ev.title} (${ev.status})`);

      // If concluded event, attach result!
      if (ev.status === 'concluded') {
        const winnerId = createdProfiles['Muhammad Hamza Khan'];
        const runnerUpId = createdProfiles['Omar Tariq'];
        const secondRunnerUpId = createdProfiles['Bilal Ahmed Farooqi'];

        await prisma.eventResult.create({
          data: {
            eventId: createdEvent.id,
            winnerId,
            runnerUpId,
            secondRunnerUpId,
            year: 2026,
            notes: 'Thrilling final buzzer shootout round between NUST and GIKI.',
            declaredBy: createdProfiles['Ayesha Siddiqui'],
          },
        });
        console.log('✓ Created event results for concluded tournament');
      }
    }
  }

  // 3. Populate Leaderboard
  const leaderboardEntries = [
    {
      userId: createdProfiles['Muhammad Hamza Khan'],
      year: 0, // All-time
      wins: 5,
      runnerUps: 2,
      totalPoints: 60, // 5*10 + 2*5
    },
    {
      userId: createdProfiles['Muhammad Hamza Khan'],
      year: 2026,
      wins: 2,
      runnerUps: 1,
      totalPoints: 25,
    },
    {
      userId: createdProfiles['Omar Tariq'],
      year: 0, // All-time
      wins: 3,
      runnerUps: 4,
      totalPoints: 50,
    },
    {
      userId: createdProfiles['Omar Tariq'],
      year: 2026,
      wins: 1,
      runnerUps: 2,
      totalPoints: 20,
    },
    {
      userId: createdProfiles['Bilal Ahmed Farooqi'],
      year: 0, // All-time
      wins: 2,
      runnerUps: 3,
      totalPoints: 35,
    },
    {
      userId: createdProfiles['Bilal Ahmed Farooqi'],
      year: 2026,
      wins: 1,
      runnerUps: 1,
      totalPoints: 15,
    },
    {
      userId: createdProfiles['Ayesha Siddiqui'],
      year: 0, // All-time
      wins: 2,
      runnerUps: 1,
      totalPoints: 25,
    },
  ];

  for (const lb of leaderboardEntries) {
    if (!lb.userId) continue;
    const existing = await prisma.leaderboard.findFirst({
      where: { userId: lb.userId, year: lb.year },
    });
    if (!existing) {
      await prisma.leaderboard.create({ data: lb });
      console.log(`✓ Created leaderboard entry for user ${lb.userId} (Year: ${lb.year})`);
    }
  }

  console.log('🎉 Seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
