import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { prisma } from '../lib/db';

function getArg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function usernameFromEmail(email: string): string {
  return (
    email
      .split('@')[0]
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 40) || 'developer'
  );
}

async function main() {
  const email = getArg('email');
  const role = getArg('role') || 'developer';
  const username = getArg('username');

  if (!email) {
    throw new Error('Missing required argument: --email');
  }

  const finalUsername = username?.trim() || usernameFromEmail(email);
  const password = randomBytes(18).toString('base64url');
  const passwordHash = await bcrypt.hash(password, 12);

  const existingAdmin = await prisma.admin.findUnique({ where: { email } });

  if (existingAdmin) {
    await prisma.admin.update({
      where: { email },
      data: {
        username: finalUsername,
        role,
        passwordHash,
        isActive: true,
      },
    });

    process.stdout.write(`${email}|${role}|${finalUsername}|${password}|updated`);
    return;
  }

  await prisma.admin.create({
    data: {
      email,
      username: finalUsername,
      role,
      passwordHash,
      isActive: true,
    },
  });

  process.stdout.write(`${email}|${role}|${finalUsername}|${password}|created`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
