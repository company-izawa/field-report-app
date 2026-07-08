const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log('--- Registered Users ---');
    users.forEach(u => {
      console.log(`ID: ${u.id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}, HasPassword: ${!!u.password}, LineWorksID: ${u.lineWorksUserId}`);
    });
  } catch (err) {
    console.error('Error reading users:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
