import { config } from 'dotenv';
import argon2 from 'argon2';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { syncAuthorizationCatalog } from '../src/modules/authorization/catalog/index.js';
import { replaceAssignments, rolesByKey } from '../src/modules/roles/assignments/index.js';

config({ path: '../../.env' });
config({ path: '.env', override: true });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is not set — copy .env.example to .env first');

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const SEED_WORKSPACE = { slug: 'lumo', name: 'Lumo' };

const SEED_USERS = [
	{
		email: 'owner@lumo.dev',
		username: 'olivia',
		name: 'Olivia Owner',
		roles: ['OWNER'],
		password: 'Owner1234',
	},
	{
		email: 'member@lumo.dev',
		username: 'mia',
		name: 'Mia Member',
		roles: ['MEMBER'],
		password: 'Member1234',
	},
];

async function main(): Promise<void> {
	await syncAuthorizationCatalog({ db: prisma });

	const workspace = await prisma.workspace.upsert({
		where: { slug: SEED_WORKSPACE.slug },
		update: { name: SEED_WORKSPACE.name },
		create: SEED_WORKSPACE,
	});

	for (const seed of SEED_USERS) {
		const passwordHash = await argon2.hash(seed.password);
		const user = await prisma.user.upsert({
			where: { email: seed.email },
			update: { username: seed.username, name: seed.name, passwordHash },
			create: {
				email: seed.email,
				username: seed.username,
				name: seed.name,
				passwordHash,
			},
		});

		const membership = await prisma.membership.upsert({
			where: { userId_workspaceId: { userId: user.id, workspaceId: workspace.id } },
			update: {},
			create: { userId: user.id, workspaceId: workspace.id },
		});

		const roles = await rolesByKey({
			client: prisma,
			workspaceId: workspace.id,
			keys: seed.roles,
		});

		await replaceAssignments({
			client: prisma,
			membershipId: membership.id,
			roleIds: roles.map((role) => role.id),
		});

		console.log(
			`seeded ${seed.email} / ${seed.password} (${seed.roles.join(', ')} in ${workspace.slug})`,
		);
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
