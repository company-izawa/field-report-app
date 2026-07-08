const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  try {
    const email = 't.nagura@kk-izawa.co.jp';
    const rawPassword = 'Izawa3088';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const updated = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    console.log(`Successfully reset password for ${email}. Name: ${updated.name}`);
  } catch (err) {
    console.error('Error resetting password:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
