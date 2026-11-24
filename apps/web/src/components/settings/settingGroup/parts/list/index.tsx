import type { ReactNode } from 'react';
import { Card } from '@/components/ui/display/card';

export const SettingsGroupList = ({ children }: { children: ReactNode }) => (
	<Card size="sm" className="py-0">
		<ul data-slot="settings-group-list" role="list" className="divide-y divide-border/60">
			{children}
		</ul>
	</Card>
);
