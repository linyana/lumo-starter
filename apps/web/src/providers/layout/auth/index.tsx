import type { ReactNode } from 'react';
import { ThemeToggle } from '@/providers/theme';

/** What the column of an anonymous screen is handed. */
type IPropsType = {
	title: string;
	description?: string;
	children: ReactNode;
	footer: ReactNode;
};

/** A full content surface inside the same inset frame as the app layout. */
export const AuthLayout = ({ title, description, children, footer }: IPropsType) => (
	<div className="min-h-svh bg-layout-background p-2">
		<main className="grid min-h-[calc(100svh-1rem)] grid-rows-[auto_1fr_auto] rounded-xl bg-layout-content p-4 sm:p-6">
			<header className="flex h-9 items-center justify-between">
				<img src="/logo.svg" alt="Lumo" className="size-8 shrink-0" />
				<ThemeToggle />
			</header>

			<div className="flex items-center justify-center py-12">
				<div className="w-full max-w-sm">
					<div className="space-y-1.5">
						<h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
						{description && (
							<p className="text-sm text-pretty text-muted-foreground">{description}</p>
						)}
					</div>

					<div className="mt-8">{children}</div>

					<p className="mt-8 text-center text-sm text-muted-foreground">{footer}</p>
				</div>
			</div>

			<div aria-hidden="true" className="h-9" />
		</main>
	</div>
);
