import { ToastProvider } from '@/components';
import { toastManager } from '@/lib';
import { AuthProvider, Routes, SettingProvider, ThemeProvider } from '@/providers';

export const App = () => (
	<ThemeProvider>
		<ToastProvider toastManager={toastManager}>
			<AuthProvider>
				<SettingProvider>
					<Routes />
				</SettingProvider>
			</AuthProvider>
		</ToastProvider>
	</ThemeProvider>
);
