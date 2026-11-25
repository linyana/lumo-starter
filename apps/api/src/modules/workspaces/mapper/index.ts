import type { Workspace as WireWorkspace } from '@lumo/shared';
import type { Prisma, Workspace as WorkspaceRow } from '../../../generated/prisma/client.js';

export const workspaceWireSelect = {
	id: true,
	slug: true,
	name: true,
} as const satisfies Prisma.WorkspaceSelect;

export type WorkspaceWireRow = Pick<WorkspaceRow, 'id' | 'slug' | 'name'>;

export const toWireWorkspace = (row: WorkspaceWireRow): WireWorkspace => ({
	id: row.id,
	slug: row.slug,
	name: row.name,
});
