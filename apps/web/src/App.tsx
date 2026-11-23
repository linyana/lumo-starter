import { ToastProvider } from '@/components';
import { toastManager } from '@/lib';
import { AuthProvider, Routes, ThemeProvider } from '@/providers';

export const App = () => (
	<ThemeProvider>
		<ToastProvider toastManager={toastManager}>
			<AuthProvider>
				<Routes />
			</AuthProvider>
		</ToastProvider>
	</ThemeProvider>
);
