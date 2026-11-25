import type { FieldError } from '@lumo/shared';
import type { Prisma } from '../../../generated/prisma/client.js';
import { AppException } from '../../errors/app.exception.js';
import type { PrismaService } from '../prisma.service.js';

type UniqueAccountField = 'email' | 'username';

const MESSAGE: Record<UniqueAccountField, string> = {
	email: 'That email is already registered',
	username: 'That username is taken',
};

const whereFor = ({
	field,
	value,
}: {
	field: UniqueAccountField;
	value: string;
}): Prisma.AccountWhereUniqueInput => (field === 'email' ? { email: value } : { username: value });

export const assertAccountFieldFree = async ({
	prisma,
	field,
	value,
}: {
	prisma: PrismaService;
	field: UniqueAccountField;
	value: string;
}): Promise<void> => {
	const taken = await prisma.account.findUnique({
		where: whereFor({ field, value }),
		select: { id: true },
	});
	if (!taken) return;

	const details: FieldError[] = [{ path: field, message: MESSAGE[field] }];
	throw new AppException({ code: 'CONFLICT', message: MESSAGE[field], details });
};
