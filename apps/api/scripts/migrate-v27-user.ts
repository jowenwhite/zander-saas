/**
 * v27 User Migration Script
 *
 * Updates the primary user record with new email, tenant, and password.
 * Run with: npm run migrate:v27:user -- --password="YourPassword"
 *
 * Requirements:
 * - DATABASE_URL must be set in environment
 * - Password must be provided via --password argument
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const TARGET_USER_ID = 'cmj6db4qo000213d7ud5uspza';
const NEW_EMAIL = 'jonathan@zanderos.com';
const NEW_TENANT_ID = 'tenant_zander';

async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const passwordArg = args.find((arg) => arg.startsWith('--password='));

  if (!passwordArg) {
    console.error('Error: --password argument is required');
    console.error('Usage: npm run migrate:v27:user -- --password="YourPassword"');
    process.exit(1);
  }

  const password = passwordArg.split('=')[1].replace(/^["']|["']$/g, '');

  if (!password || password.length < 8) {
    console.error('Error: Password must be at least 8 characters');
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    console.log('Starting v27 user migration...\n');

    // Hash password with bcrypt cost factor 10
    const passwordHash = await bcrypt.hash(password, 10);

    // Execute all updates in a single transaction
    const updatedUser = await prisma.$transaction(async (tx) => {
      // Update email
      await tx.$executeRaw`
        UPDATE users
        SET email = ${NEW_EMAIL}
        WHERE id = ${TARGET_USER_ID}
      `;
      console.log('  [1/3] Email updated to', NEW_EMAIL);

      // Update tenantId
      await tx.$executeRaw`
        UPDATE users
        SET "tenantId" = ${NEW_TENANT_ID}
        WHERE id = ${TARGET_USER_ID}
      `;
      console.log('  [2/3] Tenant updated to', NEW_TENANT_ID);

      // Update password
      await tx.$executeRaw`
        UPDATE users
        SET password = ${passwordHash}
        WHERE id = ${TARGET_USER_ID}
      `;
      console.log('  [3/3] Password updated (hash not displayed)');

      // Fetch and return updated user
      return tx.user.findUnique({
        where: { id: TARGET_USER_ID },
        select: {
          id: true,
          email: true,
          tenantId: true,
          role: true,
          isSuperAdmin: true,
          firstName: true,
          lastName: true,
        },
      });
    });

    if (!updatedUser) {
      console.error('\nError: User not found after update');
      process.exit(1);
    }

    console.log('\n----------------------------------------');
    console.log('Migration successful!');
    console.log('----------------------------------------');
    console.log('Updated user record:');
    console.log(`  id:           ${updatedUser.id}`);
    console.log(`  email:        ${updatedUser.email}`);
    console.log(`  tenantId:     ${updatedUser.tenantId}`);
    console.log(`  role:         ${updatedUser.role}`);
    console.log(`  isSuperAdmin: ${updatedUser.isSuperAdmin}`);
    console.log(`  name:         ${updatedUser.firstName} ${updatedUser.lastName}`);
    console.log('----------------------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('\nMigration failed:', error.message);
    console.error('Transaction rolled back - no changes were made.');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
