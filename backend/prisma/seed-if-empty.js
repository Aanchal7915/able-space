// Deploy-time guard: only runs the (non-idempotent) TypeScript seed script
// when the database is empty, so redeploying/restarting the container never
// duplicates demo data.
const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

async function main() {
  const prisma = new PrismaClient();
  const userCount = await prisma.user.count();
  await prisma.$disconnect();

  if (userCount > 0) {
    console.log(`Skipping seed: database already has ${userCount} user(s).`);
    return;
  }

  console.log('Database is empty, running seed...');
  execSync('npx ts-node prisma/seed.ts', { stdio: 'inherit' });
}

main().catch((err) => {
  console.error('seed-if-empty failed:', err);
  process.exit(1);
});
