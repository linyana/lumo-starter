import type { z } from 'zod';
import type { workspaceSchema } from './index';

export type Workspace = z.infer<typeof workspaceSchema>;
