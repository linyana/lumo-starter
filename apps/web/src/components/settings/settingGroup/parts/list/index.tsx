import type { ReactNode } from 'react';
import { Card } from '@/components/ui/display/card';
import type { CardSurface } from '@/components/ui/display/card/parts';

export const SettingsGroupList = ({
	children,
	surface = 'white',
}: {
	children: ReactNode;
	surface?: CardSurface;
}) => (
	<Card size="sm" surface={surface} className="py-0">
		<ul data-slot="settings-group-list" role="list" className="divide-y divide-border/60">
			{children}
		</ul>
	</Card>
);
