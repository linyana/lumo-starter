import { CircleUserRound, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { Dialog, Nav } from '@/components';
import { PreferenceSection } from '../preference';
import { ProfileSection } from '../profile';

const SECTIONS = [
	{ type: 'item', key: 'profile', label: 'Profile', icon: <CircleUserRound /> },
	{ type: 'item', key: 'preference', label: 'Preference', icon: <SlidersHorizontal /> },
] as const;

type Section = (typeof SECTIONS)[number]['key'];

/** Yours, not a workspace's: it opens over whatever page you are on and never changes the URL. */
export const AccountDialog = ({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) => {
	const [section, setSection] = useState<Section>('profile');

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
			title="Account"
			description="Your own settings. They follow you across workspaces."
			className="h-[36rem] max-h-[calc(100dvh-2rem)] w-[56rem] max-w-[calc(100dvw-2rem)]"
		>
			<div className="grid gap-6 sm:grid-cols-[10rem_minmax(0,1fr)]">
				<Nav
					items={[...SECTIONS]}
					selectedKey={section}
					onSelect={(key) => {
						setSection(key as Section);
					}}
					classNames={{ button: 'h-8 text-sm' }}
				/>
				<div className="min-w-0">
					{section === 'profile' ? <ProfileSection /> : <PreferenceSection />}
				</div>
			</div>
		</Dialog>
	);
};
