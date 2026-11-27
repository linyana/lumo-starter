import { RotateCcw } from 'lucide-react';
import { Button } from '@/components';
import { useTokenEditor } from './editor';

export const ResetOverrides = () => {
	const editor = useTokenEditor();
	if (editor.count === 0) return null;

	return (
		<Button variant="ghost" size="sm" icon={<RotateCcw />} onClick={editor.reset}>
			Reset {editor.count}
		</Button>
	);
};
