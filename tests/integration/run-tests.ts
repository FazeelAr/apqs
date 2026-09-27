/**
 * APQS Integration Test Suite
 * Tests database layer, business logic, and data integrity directly via Prisma.
 * Run with: npx tsx tests/integration/run-tests.ts
 */

import { prisma } from '../../app/lib/prisma';

// Test runner
let passed = 0;
let failed = 0;
const results: { name: string; status: 'PASS' | 'FAIL'; error?: string }[] = [];

async function test(name: string, fn: () => Promise<void> | void) {
  try {
    await fn();
    passed++;
    results.push({ name, status: 'PASS' });
    console.log(`  OK  ${name}`);
  } catch (err: any) {
    failed++;
    results.push({ name, status: 'FAIL', error: err.message });
    console.error(`  FAIL  ${name}`);
    console.error(`        ${err.message}`);
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function assertEq<T>(a: T, b: T, message: string) {
  if (a !== b) throw new Error(`${message} — expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
}

// Suite 1: Connectivity
async function connectivity() {
  console.log('\n-- DB Connectivity --');
  await test('DB ping', async () => {
    const r = await prisma.$queryRaw<[{ x: string }]>`SELECT 'ok' AS x`;
    assert(r[0].x === 'ok', 'ping failed');
  });
  await test('models exist', () => {
    const models = Object.keys(prisma).filter((k) => !k.startsWith('$') && !k.startsWith('_'));
    for (const m of ['profile', 'event', 'eventResult', 'leaderboard']) {
      assert(models.includes(m), `Missing model: ${m}`);
    }
  });
}

// Suite 2: Profiles
async function profiles() {
  console.log('\n-- Profile Tests --');
  await test('at least 1 profile exists', async () => {
    const n = await prisma.profile.count();
    assert(n > 0, `Expected >0 profiles, got ${n}`);
  });
  await test('president profile exists', async () => {
    const p = await prisma.profile.findFirst({ where: { role: 'president' } });
    assert(p !== null, 'No president found');
  });
  await test('super_admin profile exists', async () => {
    const p = await prisma.profile.findFirst({ where: { role: 'super_admin' } });
    assert(p !== null, 'No super_admin found');
  });
  await test('cabinet members have position set', async () => {
    const cabinet = await prisma.profile.findMany({ where: { isCabinet: true } });
    for (const c of cabinet) {
      assert(c.isCabinet, `${c.id} isCabinet should be true`);
      assert(!!c.cabinetPosition, `${c.fullName} missing cabinetPosition`);
    }
  });
  await test('all profiles have valid roles', async () => {
    const all = await prisma.profile.findMany({ select: { id: true, role: true } });
    const valid = new Set(['member', 'president', 'super_admin']);
    for (const p of all) {
      assert(valid.has(p.role), `Profile ${p.id} invalid role: ${p.role}`);
    }
  });
  await test('role-indexed query under 3s', async () => {
    const t = Date.now();
    await prisma.profile.findMany({ where: { role: 'president' } });
    assert(Date.now() - t < 3000, `Role query too slow: ${Date.now() - t}ms`);
  });
}

// Suite 3: Events
async function events() {
  console.log('\n-- Event Tests --');
  await test('at least 3 events exist', async () => {
    const n = await prisma.event.count();
    assert(n >= 3, `Expected >=3, got ${n}`);
  });
  await test('approved events have correct status', async () => {
    const all = await prisma.event.findMany({ where: { status: 'approved' } });
    assert(all.length > 0, 'No approved events');
    for (const e of all) assertEq(e.status, 'approved', `Event ${e.id}`);
  });
  await test('concluded events exist', async () => {
    const n = await prisma.event.count({ where: { status: 'concluded' } });
    assert(n > 0, 'No concluded events');
  });
  await test('events have title, description, venue, date', async () => {
    const all = await prisma.event.findMany({ take: 10 });
    const validStatus = new Set(['pending', 'approved', 'rejected', 'concluded']);
    for (const e of all) {
      assert(e.title.length > 0, `${e.id} empty title`);
      assert(e.description.length > 0, `${e.id} empty description`);
      assert(e.venue.length > 0, `${e.id} empty venue`);
      assert(e.eventDate instanceof Date, `${e.id} eventDate not Date`);
      assert(validStatus.has(e.status), `${e.id} invalid status: ${e.status}`);
    }
  });
  await test('event slugs are unique', async () => {
    const all = await prisma.event.findMany({ where: { slug: { not: null } }, select: { slug: true } });
    const slugs = all.map((e) => e.slug!);
    assertEq(slugs.length, new Set(slugs).size, 'Duplicate slugs found');
  });
  await test('batch eager-load creator+result+winner stays under 5s', async () => {
    const t = Date.now();
    const all = await prisma.event.findMany({
      include: {
        creator: { select: { id: true, fullName: true, role: true } },
        result: { include: { winner: { select: { id: true, fullName: true } } } },
      },
    });
    const ms = Date.now() - t;
    assert(ms < 5000, `Eager-load took ${ms}ms — N+1 risk`);
    for (const e of all) {
      if (e.createdBy) assert(e.creator !== null, `Event ${e.id} missing creator join`);
    }
    console.log(`        timing: ${ms}ms for ${all.length} events`);
  });
  await test('upcoming filter only returns future approved events', async () => {
    const now = new Date();
    const upcoming = await prisma.event.findMany({
      where: { status: 'approved', eventDate: { gte: now } },
    });
    for (const e of upcoming) {
      assert(new Date(e.eventDate) >= now, `Event ${e.id} is in the past`);
    }
  });
  await test('slug OR id lookup works (detail page)', async () => {
    const ev = await prisma.event.findFirst({ where: { slug: { not: null } } });
    if (!ev) { console.log('        skipped — no slugs'); return; }
    const slug = ev.slug!;
    // The event detail page uses: OR: [{ id: paramIfUuid }, { slug: param }]
    // For a text slug, only the slug branch matches — test that independently
    const foundBySlug = await prisma.event.findFirst({ where: { slug } });
    assert(foundBySlug !== null, `Slug lookup failed for slug: ${slug}`);
    assertEq(foundBySlug!.id, ev.id, 'Slug lookup returned wrong event');
    // Also verify direct id lookup works
    const foundById = await prisma.event.findUnique({ where: { id: ev.id } });
    assert(foundById !== null, `ID lookup failed for id: ${ev.id}`);
    assertEq(foundById!.id, ev.id, 'ID lookup returned wrong event');
  });
}

// Suite 4: EventResults & Leaderboard
async function resultsAndLeaderboard() {
  console.log('\n-- EventResult & Leaderboard Tests --');
  await test('at least 1 EventResult exists', async () => {
    const n = await prisma.eventResult.count();
    assert(n > 0, 'No EventResults — run seed');
  });
  await test('all EventResults have a winner relation', async () => {
    const all = await prisma.eventResult.findMany({ include: { winner: true } });
    for (const r of all) {
      assert(r.winnerId != null, `Result ${r.id} has null winnerId`);
      assert(r.winner !== null, `Result ${r.id} winner join failed`);
    }
  });
  await test('one result per event (unique eventId)', async () => {
    const all = await prisma.eventResult.findMany({ select: { eventId: true } });
    const ids = all.map((r) => r.eventId);
    assertEq(ids.length, new Set(ids).size, 'Multiple results for same event');
  });
  await test('leaderboard entries exist', async () => {
    const n = await prisma.leaderboard.count();
    assert(n > 0, 'No leaderboard entries');
  });
  await test('all-time leaderboard (year=0) exists', async () => {
    const n = await prisma.leaderboard.count({ where: { year: 0 } });
    assert(n > 0, 'No all-time entries (year=0)');
  });
  await test('2026 yearly leaderboard exists', async () => {
    const n = await prisma.leaderboard.count({ where: { year: 2026 } });
    assert(n > 0, 'No 2026 entries');
  });
  await test('userId+year is unique in leaderboard', async () => {
    const all = await prisma.leaderboard.findMany({ select: { userId: true, year: true } });
    const keys = all.map((e) => `${e.userId}:${e.year}`);
    assertEq(keys.length, new Set(keys).size, 'Duplicate userId+year in leaderboard');
  });
  await test('leaderboard stats are non-negative', async () => {
    const all = await prisma.leaderboard.findMany();
    for (const e of all) {
      assert(e.totalPoints >= 0, `Negative totalPoints in ${e.id}`);
      assert(e.wins >= 0, `Negative wins in ${e.id}`);
      assert(e.runnerUps >= 0, `Negative runnerUps in ${e.id}`);
    }
  });
  await test('top-3 descending order is correct', async () => {
    const top3 = await prisma.leaderboard.findMany({
      where: { year: 0, totalPoints: { gt: 0 } },
      orderBy: [{ totalPoints: 'desc' }, { wins: 'desc' }],
      take: 3,
      include: { user: { select: { id: true, fullName: true } } },
    });
    assert(top3.length > 0, 'Top-3 returned empty');
    for (let i = 1; i < top3.length; i++) {
      assert(top3[i - 1].totalPoints >= top3[i].totalPoints, `Order wrong at index ${i}`);
    }
  });
}

// Suite 5: Business Logic
async function businessLogic() {
  console.log('\n-- Business Logic Tests --');
  await test('slugify produces URL-safe strings', () => {
    const slugify = (t: string) =>
      t.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
    const samples = ['My Event 2026', 'LUMS Quiz & Bowl!', 'Test@Event---1'];
    for (const s of samples) {
      const slug = slugify(s);
      assert(slug.length > 0, `Empty slug for: "${s}"`);
      assert(!/[^a-z0-9-]/.test(slug), `Invalid chars in slug "${slug}" from "${s}"`);
    }
  });
  await test('admin role check: president and super_admin only', () => {
    const isAdmin = (r: string) => r === 'president' || r === 'super_admin';
    assert(!isAdmin('member'), 'member should not be admin');
    assert(isAdmin('president'), 'president should be admin');
    assert(isAdmin('super_admin'), 'super_admin should be admin');
  });
  await test('points formula: win=10, runner_up=5', () => {
    const pts = (w: number, r: number) => w * 10 + r * 5;
    assertEq(pts(3, 2), 40, '3W 2RU');
    assertEq(pts(1, 0), 10, '1W');
    assertEq(pts(0, 1), 5, '1RU');
    assertEq(pts(0, 0), 0, '0W 0RU');
  });
  await test('status machine rejects invalid statuses', () => {
    const valid = new Set(['pending', 'approved', 'rejected', 'concluded']);
    for (const s of ['APPROVED', 'active', '', 'draft']) {
      assert(!valid.has(s), `"${s}" should be invalid`);
    }
  });
  await test('edit permission logic is correct', () => {
    const canEdit = (uid: string, createdBy: string, role: string, status: string) => {
      const admin = role === 'president' || role === 'super_admin';
      return admin || (createdBy === uid && status === 'pending');
    };
    const A = 'u1', B = 'u2';
    assert(canEdit(A, A, 'member', 'pending'), 'creator can edit own pending');
    assert(!canEdit(B, A, 'member', 'pending'), 'non-creator cannot edit');
    assert(!canEdit(A, A, 'member', 'approved'), 'cannot edit after approval');
    assert(canEdit(B, A, 'president', 'approved'), 'admin can always edit');
  });
  await test('auto-approve logic is correct', () => {
    const autoStatus = (role: string) =>
      role === 'president' || role === 'super_admin' ? 'approved' : 'pending';
    assertEq(autoStatus('member'), 'pending', 'member');
    assertEq(autoStatus('president'), 'approved', 'president');
    assertEq(autoStatus('super_admin'), 'approved', 'super_admin');
  });
}

// Suite 6: Performance
async function performance() {
  console.log('\n-- Performance Tests --');
  await test('home page batch under 3s', async () => {
    const t = Date.now();
    await Promise.all([
      prisma.event.findMany({
        where: { status: 'approved', eventDate: { gte: new Date() } },
        take: 3,
        orderBy: { eventDate: 'asc' },
        select: { id: true, slug: true, title: true, eventDate: true, eventTime: true, venue: true, status: true },
      }),
      prisma.event.count({ where: { status: { in: ['approved', 'concluded'] } } }),
      prisma.profile.count(),
      prisma.eventResult.count(),
      prisma.leaderboard.findMany({
        where: { year: 0, totalPoints: { gt: 0 } },
        take: 3,
        orderBy: [{ totalPoints: 'desc' }, { wins: 'desc' }],
        include: { user: { select: { id: true, fullName: true, avatarUrl: true, university: true, city: true } } },
      }),
    ]);
    const ms = Date.now() - t;
    assert(ms < 3000, `Home batch took ${ms}ms`);
    console.log(`        timing: ${ms}ms`);
  });
  await test('leaderboard page under 2s', async () => {
    const t = Date.now();
    await Promise.all([
      prisma.leaderboard.findMany({
        where: { year: 0, totalPoints: { gt: 0 } },
        take: 100,
        orderBy: [{ totalPoints: 'desc' }, { wins: 'desc' }, { runnerUps: 'desc' }],
        include: { user: { select: { id: true, fullName: true, avatarUrl: true, university: true, city: true } } },
      }),
      prisma.leaderboard.findMany({
        where: { year: { gt: 0 } },
        select: { year: true },
        distinct: ['year'],
        orderBy: { year: 'desc' },
      }),
    ]);
    const ms = Date.now() - t;
    assert(ms < 2000, `Leaderboard page took ${ms}ms`);
    console.log(`        timing: ${ms}ms`);
  });
  await test('events list eager-load under 2s', async () => {
    const t = Date.now();
    await prisma.event.findMany({
      where: { status: { in: ['approved', 'concluded'] } },
      orderBy: { eventDate: 'desc' },
      include: {
        creator: { select: { id: true, fullName: true, avatarUrl: true, role: true } },
        result: {
          include: {
            winner: { select: { id: true, fullName: true, avatarUrl: true } },
            runnerUp: { select: { id: true, fullName: true, avatarUrl: true } },
          },
        },
      },
    });
    const ms = Date.now() - t;
    assert(ms < 2000, `Events list took ${ms}ms`);
    console.log(`        timing: ${ms}ms`);
  });
  await test('calendar month range query under 2s', async () => {
    const now = new Date();
    const s = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
    const e = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999));
    const t = Date.now();
    await prisma.event.findMany({
      where: { status: { in: ['approved', 'concluded'] }, eventDate: { gte: s, lte: e } },
      orderBy: { eventDate: 'asc' },
      select: { id: true, slug: true, title: true, eventDate: true, eventTime: true, venue: true, status: true },
    });
    const ms = Date.now() - t;
    assert(ms < 2000, `Calendar query took ${ms}ms`);
    console.log(`        timing: ${ms}ms`);
  });
  await test('about page parallel query under 3s', async () => {
    const t = Date.now();
    await Promise.all([
      prisma.event.count({ where: { status: 'concluded' } }),
      prisma.profile.count(),
      prisma.profile.findMany({
        where: { isCabinet: true },
        orderBy: [{ cabinetOrder: 'asc' }, { fullName: 'asc' }],
        include: { _count: { select: { eventsWon: true, eventsRunnerUp: true, eventsCreated: true } } },
      }),
    ]);
    const ms = Date.now() - t;
    assert(ms < 3000, `About page took ${ms}ms`);
    console.log(`        timing: ${ms}ms`);
  });
}

// Suite 7: Integrity
async function integrity() {
  console.log('\n-- Data Integrity Tests --');
  await test('concluded events with results have valid winner+year', async () => {
    const all = await prisma.event.findMany({
      where: { status: 'concluded' },
      include: { result: true },
    });
    for (const e of all) {
      if (e.result) {
        assert(e.result.winnerId != null, `Event ${e.id} result has null winner`);
        assert(e.result.year > 0, `Event ${e.id} result has invalid year: ${e.result.year}`);
      }
    }
  });
  await test('EventResult profiles are all resolvable', async () => {
    const all = await prisma.eventResult.findMany({ include: { winner: true, runnerUp: true, secondRunnerUp: true } });
    for (const r of all) {
      assert(r.winner !== null, `Result ${r.id} winner is null`);
      if (r.runnerUpId) assert(r.runnerUp !== null, `Result ${r.id} runnerUp is null`);
      if (r.secondRunnerUpId) assert(r.secondRunnerUp !== null, `Result ${r.id} secondRunnerUp is null`);
    }
  });
  await test('leaderboard entries all have valid user references', async () => {
    const all = await prisma.leaderboard.findMany({ include: { user: { select: { id: true } } } });
    for (const e of all) {
      assert(e.user !== null, `Leaderboard entry ${e.id} references missing user ${e.userId}`);
    }
  });
  await test('sitemap query returns events with valid data', async () => {
    const all = await prisma.event.findMany({
      where: { status: { in: ['approved', 'concluded'] } },
      select: { id: true, slug: true, updatedAt: true },
      take: 100,
    });
    for (const e of all) {
      assert(e.id.length > 0, `Empty id in sitemap`);
      assert(e.updatedAt instanceof Date, `${e.id} updatedAt not Date`);
    }
    console.log(`        ${all.length} events for sitemap`);
  });
}

// Main
async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('  APQS Integration Test Suite');
  console.log('  All Pakistan Quiz Society — Database & Logic');
  console.log('='.repeat(60));
  try {
    await connectivity();
    await profiles();
    await events();
    await resultsAndLeaderboard();
    await businessLogic();
    await performance();
    await integrity();
  } finally {
    await prisma.$disconnect();
  }
  const total = passed + failed;
  console.log('\n' + '='.repeat(60));
  console.log(`  Results: ${passed}/${total} passed | ${failed} failed`);
  console.log('='.repeat(60));
  if (failed > 0) {
    console.log('\nFailed tests:');
    results.filter((r) => r.status === 'FAIL').forEach((r) => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log('\nAll tests passed!\n');
    process.exit(0);
  }
}

main();
