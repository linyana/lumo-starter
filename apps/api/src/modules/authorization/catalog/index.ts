import {
	PERMISSIONS,
	PERMISSION_META,
	SYSTEM_ROLES,
	SYSTEM_ROLE_META,
	SYSTEM_ROLE_PERMISSIONS,
} from '@lumo/shared';
import type { PrismaClient } from '../../../generated/prisma/client.js';

export const syncAuthorizationCatalog = async ({ db }: { db: PrismaClient }): Promise<void> => {
	await db.$transaction(async (tx) => {
		for (const key of PERMISSIONS) {
			await tx.permission.upsert({
				where: { key },
				update: { description: PERMISSION_META[key] },
				create: { key, description: PERMISSION_META[key] },
			});
		}

		await tx.permission.deleteMany({ where: { key: { notIn: [...PERMISSIONS] } } });

		await tx.role.deleteMany({ where: { system: true, key: { notIn: [...SYSTEM_ROLES] } } });

		for (const key of SYSTEM_ROLES) {
			const existing = await tx.role.findFirst({
				where: { key, system: true },
				select: { id: true },
			});

			const role =
				existing ??
				(await tx.role.create({ data: { key, name: SYSTEM_ROLE_META[key], system: true } }));

			if (existing) {
				await tx.role.update({
					where: { id: role.id },
					data: { name: SYSTEM_ROLE_META[key] },
				});
			}

			await tx.rolePermission.deleteMany({ where: { roleId: role.id } });
			await tx.rolePermission.createMany({
				data: SYSTEM_ROLE_PERMISSIONS[key].map((permissionKey) => ({
					roleId: role.id,
					permissionKey,
				})),
			});
		}
	});
};
