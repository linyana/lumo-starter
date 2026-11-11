import { config } from 'dotenv';
import argon2 from 'argon2';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

config({ path: '../../.env' });
config({ path: '.env', override: true });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is not set — copy .env.example to .env first');

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

/**
 * Three accounts, one per role, so the permission matrix is testable from the
 * UI without editing SQL. Passwords are dev-only and printed below.
 */
const SEED_USERS = [
	{ email: 'owner@lumo.dev', name: 'Olivia Owner', roles: ['OWNER'], password: 'Owner1234' },
	{ email: 'admin@lumo.dev', name: 'Adam Admin', roles: ['ADMIN'], password: 'Admin1234' },
	{ email: 'member@lumo.dev', name: 'Mia Member', roles: ['MEMBER'], password: 'Member1234' },
];

async function main(): Promise<void> {
	for (const seed of SEED_USERS) {
		const passwordHash = await argon2.hash(seed.password);
		await prisma.user.upsert({
			where: { email: seed.email },
			update: { name: seed.name, roles: seed.roles, passwordHash },
			create: { email: seed.email, name: seed.name, roles: seed.roles, passwordHash },
		});
		console.log(`seeded ${seed.email} / ${seed.password} (${seed.roles.join(', ')})`);
	}
}

main()
	.catch((error: unknown) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(() => {
		prisma.$disconnect();
	});
