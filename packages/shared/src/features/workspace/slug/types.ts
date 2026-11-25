import type { z } from 'zod';
import type { workspaceSlugSchema } from './index';

export type WorkspaceSlug = z.infer<typeof workspaceSlugSchema>;
