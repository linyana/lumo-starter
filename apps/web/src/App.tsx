import { ToastProvider } from '@/components';
import { toastManager } from '@/lib';
import { AuthProvider, Routes, ThemeProvider } from '@/providers';

/**
 * Provider order matters: the auth context calls `refreshSession()` on mount and
 * registers the "session is gone" handler, so it sits inside the toast provider
 * — which owns the one queue a failed request raises into. The router comes last,
 * because guards read auth. The theme is outermost because it depends on nothing
 * above it: it mirrors the store onto the document and every frame draws its toggle.
 * App-wide state is a store (`hooks/use-global`), so only the document sync needs
 * a slot here.
 */
export const App = () => (
	<ThemeProvider>
		<ToastProvider toastManager={toastManager}>
			<AuthProvider>
				<Routes />
			</AuthProvider>
		</ToastProvider>
	</ThemeProvider>
);
