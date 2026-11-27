import { Download, Plus } from 'lucide-react';
import { Button, Tooltip } from '@/components';
import { DesignShell } from '../shell';
import { Members } from './members';

export const DesignPlaygroundPage = () => (
	<DesignShell
		title="Playground"
		description="A working screen, not a catalogue: every control here is the real component."
		actions={
			<>
				<Tooltip content="Download a CSV of everyone" side="bottom">
					<Button variant="secondary" icon={<Download />}>
						Export
					</Button>
				</Tooltip>
				<Button icon={<Plus />}>Invite</Button>
			</>
		}
	>
		<Members />
	</DesignShell>
);
