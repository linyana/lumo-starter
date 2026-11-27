import { RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Button, Input, Popover, Separator } from '@/components';
import { components } from '../components/manifest';
import { useTokenEditor } from './editor';
import { editTargetOf, isLive, paintsAsColor, tokenNamed, valueOf } from './model';

const ValueEditor = ({ name }: { name: string }) => {
	const editor = useTokenEditor();
	const target = editTargetOf(name);
	const value = editor.valueOf(name);
	const [draft, setDraft] = useState(value);

	useEffect(() => setDraft(value), [value]);

	return (
		<div className="flex items-center gap-1">
			<Input
				size="sm"
				aria-label={name}
				value={draft}
				disabled={!isLive(target)}
				onChange={(event) => {
					setDraft(event.target.value);
					editor.set({ name: target, value: event.target.value });
				}}
				onKeyDown={(event) => {
					if (event.key === 'Escape') {
						editor.set({ name: target, value: '' });
						setDraft(editor.valueOf(name));
					}
				}}
				className="min-w-0 flex-1 font-mono text-xs"
			/>
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				aria-label={`Reset ${name}`}
				icon={<RotateCcw />}
				disabled={!editor.overridden(name)}
				onClick={() => editor.set({ name: target, value: '' })}
				className="shrink-0"
			/>
		</div>
	);
};

export const TokenRow = ({ name }: { name: string }) => {
	const editor = useTokenEditor();
	const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
	const target = editTargetOf(name);
	const token = tokenNamed(target);
	const value = editor.valueOf(name);
	const light =
		editor.overrides.light[target] ??
		(token === undefined ? '' : valueOf({ token, theme: 'light' }));
	const dark = editor.overrides.dark[target] ?? token?.dark ?? 'inherits light';
	const users = components.filter(
		(item) => item.tokens.includes(target) || item.sharedTokens.includes(target),
	);

	const status =
		target === name
			? isLive(name)
				? 'Runtime variable: edits apply immediately.'
				: 'No rule reads this at runtime.'
			: `Compile-time alias; ${target} is what takes effect.`;

	return (
		<Popover
			side="bottom"
			align="start"
			anchor={point}
			arrow={false}
			className="w-80"
			trigger={
				<button
					type="button"
					title={`Edit ${name}`}
					onPointerDown={(event) => setPoint({ x: event.clientX, y: event.clientY })}
					className="flex w-full items-start gap-2 rounded-md px-1.5 py-1 text-left transition-colors hover:bg-accent"
				>
					<span className="mt-1 grid size-4 shrink-0 place-items-center">
						{paintsAsColor(value) && (
							<span
								aria-hidden
								className="size-4 rounded border border-border-soft"
								style={{ background: `var(${target})` }}
							/>
						)}
					</span>
					<code className="min-w-0 font-mono text-xs break-all">{name}</code>
					<code className="min-w-0 flex-1 text-right font-mono text-[11px] break-all text-muted-foreground">
						{value}
					</code>
				</button>
			}
		>
			<div className="space-y-3">
				<div className="space-y-1">
					<code className="block font-mono text-xs">{name}</code>
					<p className="text-[11px] text-muted-foreground">{status}</p>
				</div>

				<ValueEditor name={name} />

				<div className="grid grid-cols-2 gap-2 text-[11px]">
					<div className="min-w-0">
						<p className="text-muted-foreground">light</p>
						<p className="font-mono break-all">{light}</p>
					</div>
					<div className="min-w-0">
						<p className="text-muted-foreground">dark</p>
						<p className="font-mono break-all">{dark}</p>
					</div>
				</div>

				<Separator />

				<div className="space-y-1">
					<p className="text-[11px] text-muted-foreground">
						{users.length === 0
							? 'No component references it directly'
							: `Referenced by ${users.length} components`}
					</p>
					{users.length > 0 && (
						<div className="flex flex-wrap gap-x-2 gap-y-1">
							{users.map((user) => (
								<Link
									key={user.name}
									to={`/design/components/${user.name}`}
									className="text-xs text-primary underline-offset-4 hover:underline"
								>
									{user.name}
								</Link>
							))}
						</div>
					)}
				</div>

				<Link
					to={`/design/tokens?token=${encodeURIComponent(name)}`}
					className="block text-xs text-primary underline-offset-4 hover:underline"
				>
					Open in Tokens →
				</Link>
			</div>
		</Popover>
	);
};
