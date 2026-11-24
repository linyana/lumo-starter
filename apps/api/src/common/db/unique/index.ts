import type { Prisma } from '../../../generated/prisma/client.js';
import { AppException } from '../../errors/app.exception.js';
import type { PrismaService } from '../prisma.service.js';

type UniqueUserField = 'email' | 'username';

const MESSAGE: Record<UniqueUserField, string> = {
	email: 'That email is already registered',
	username: 'That username is taken',
};

const whereFor = ({
	field,
	value,
}: {
	field: UniqueUserField;
	value: string;
}): Prisma.UserWhereUniqueInput => (field === 'email' ? { email: value } : { username: value });

export const assertUserFieldFree = async ({
	prisma,
	field,
	value,
}: {
	prisma: PrismaService;
	field: UniqueUserField;
	value: string;
}): Promise<void> => {
	const taken = await prisma.user.findUnique({
		where: whereFor({ field, value }),
		select: { id: true },
	});
	if (taken) throw new AppException({ code: 'CONFLICT', message: MESSAGE[field] });
};
