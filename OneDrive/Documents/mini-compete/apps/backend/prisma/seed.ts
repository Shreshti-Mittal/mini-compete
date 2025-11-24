import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create organizers
  const organizer1 = await prisma.user.upsert({
    where: { email: 'organizer1@test.com' },
    update: {},
    create: {
      name: 'Organizer One',
      email: 'organizer1@test.com',
      password: hashedPassword,
      role: Role.ORGANIZER,
    },
  });

  const organizer2 = await prisma.user.upsert({
    where: { email: 'organizer2@test.com' },
    update: {},
    create: {
      name: 'Organizer Two',
      email: 'organizer2@test.com',
      password: hashedPassword,
      role: Role.ORGANIZER,
    },
  });

  // Create participants
  const participants = [];
  for (let i = 1; i <= 5; i++) {
    const participant = await prisma.user.upsert({
      where: { email: `participant${i}@test.com` },
      update: {},
      create: {
        name: `Participant ${i}`,
        email: `participant${i}@test.com`,
        password: hashedPassword,
        role: Role.PARTICIPANT,
      },
    });
    participants.push(participant);
  }

  // Create competitions
  const now = new Date();
  const competitions = [];

  // Competition 1: Past deadline, capacity 50
  const comp1 = await prisma.competition.create({
    data: {
      title: 'Summer Coding Challenge 2024',
      description: 'A comprehensive coding competition focusing on algorithms and data structures. Test your skills against the best developers.',
      tags: ['coding', 'algorithms'],
      capacity: 50,
      regDeadline: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      organizerId: organizer1.id,
    },
  });
  competitions.push(comp1);

  // Competition 2: Closing soon (within 24 hours), capacity 100
  const comp2 = await prisma.competition.create({
    data: {
      title: 'Design Hackathon',
      description: 'Join us for an exciting 48-hour design hackathon. Create innovative UI/UX solutions for real-world problems.',
      tags: ['design', 'hackathon'],
      capacity: 100,
      regDeadline: new Date(now.getTime() + 12 * 60 * 60 * 1000), // 12 hours from now
      organizerId: organizer1.id,
    },
  });
  competitions.push(comp2);

  // Competition 3: Future deadline, capacity 150
  const comp3 = await prisma.competition.create({
    data: {
      title: 'Tech Innovation Summit',
      description: 'A prestigious competition for tech innovators. Showcase your groundbreaking projects and win amazing prizes.',
      tags: ['hackathon', 'innovation'],
      capacity: 150,
      regDeadline: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      organizerId: organizer2.id,
    },
  });
  competitions.push(comp3);

  // Competition 4: Future deadline, capacity 200
  const comp4 = await prisma.competition.create({
    data: {
      title: 'Sports Championship 2024',
      description: 'Annual sports competition featuring multiple events. Compete in various sports and win medals.',
      tags: ['sports', 'fitness'],
      capacity: 200,
      regDeadline: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      organizerId: organizer2.id,
    },
  });
  competitions.push(comp4);

  // Competition 5: Future deadline, capacity 250
  const comp5 = await prisma.competition.create({
    data: {
      title: 'Digital Art Exhibition',
      description: 'Showcase your digital art creations. Open to all digital artists, from beginners to professionals.',
      tags: ['art', 'design', 'creative'],
      capacity: 250,
      regDeadline: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      organizerId: organizer1.id,
    },
  });
  competitions.push(comp5);

  console.log('Seed data created:');
  console.log('Organizers:', organizer1.email, organizer2.email);
  console.log('Participants:', participants.map(p => p.email).join(', '));
  console.log('Competitions:', competitions.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

