const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hp = await bcrypt.hash('password123', 10);
  
  await prisma.user.upsert({
    where: { email: 'seeker@shel.com' },
    update: { password: hp },
    create: {
      name: 'Test Seeker',
      email: 'seeker@shel.com',
      phone: '9876543210',
      password: hp,
      role: 'SEEKER',
      gender: 'MALE'
    }
  });

  await prisma.user.upsert({
    where: { email: 'owner@shel.com' },
    update: { password: hp },
    create: {
      name: 'Test Owner',
      email: 'owner@shel.com',
      phone: '9876543211',
      password: hp,
      role: 'OWNER',
      gender: 'MALE'
    }
  });

  console.log('Seeded seeker@shel.com and owner@shel.com successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
