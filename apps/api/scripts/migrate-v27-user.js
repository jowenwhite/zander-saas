"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const TARGET_USER_ID = 'cmj6db4qo000213d7ud5uspza';
const NEW_EMAIL = 'jonathan@zanderos.com';
const NEW_TENANT_ID = 'tenant_zander';
async function main() {
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
    const prisma = new client_1.PrismaClient();
    try {
        console.log('Starting v27 user migration...\n');
        const passwordHash = await bcrypt.hash(password, 10);
        const updatedUser = await prisma.$transaction(async (tx) => {
            await tx.$executeRaw `
        UPDATE users
        SET email = ${NEW_EMAIL}
        WHERE id = ${TARGET_USER_ID}
      `;
            console.log('  [1/3] Email updated to', NEW_EMAIL);
            await tx.$executeRaw `
        UPDATE users
        SET "tenantId" = ${NEW_TENANT_ID}
        WHERE id = ${TARGET_USER_ID}
      `;
            console.log('  [2/3] Tenant updated to', NEW_TENANT_ID);
            await tx.$executeRaw `
        UPDATE users
        SET password = ${passwordHash}
        WHERE id = ${TARGET_USER_ID}
      `;
            console.log('  [3/3] Password updated (hash not displayed)');
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
    }
    catch (error) {
        console.error('\nMigration failed:', error.message);
        console.error('Transaction rolled back - no changes were made.');
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=migrate-v27-user.js.map