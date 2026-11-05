import { Toast } from '@/components/ui/toast';
import { toastManager } from '@/lib';
import { AuthProvider, Routes, ThemeProvider } from '@/providers';

/**
 * Provider order matters: the auth context calls `refreshSession()` on mount and
 * registers the "session is gone" handler, so it sits inside the toast provider
 * — which owns the one queue a failed request raises into. The router comes last,
 * because guards read auth. The theme is outermost because it depends on nothing
 * above it: it keeps the document and storage in step, and every frame draws its
 * toggle. App-wide *data* is a store (`hooks/use-global`), not a provider, so it
 * needs no slot here.
 */
export const App = () => (
	<ThemeProvider>
		<Toast.Provider toastManager={toastManager}>
			<AuthProvider>
				<Routes />
				<Toast.Toaster />
			</AuthProvider>
		</Toast.Provider>
	</ThemeProvider>
);
