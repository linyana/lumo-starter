import { loginSchema } from '@lumo/shared';
import { Link, useLocation, useNavigate } from 'react-router';
import { Button, Field, Form, Input } from '@/components';
import { useHttp } from '@/hooks';
import { useAuth } from '@/providers/auth';
import { AuthLayout } from '@/providers/layout';

export const LoginPage = () => {
	const { login } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	const from = (location.state as { from?: string } | null)?.from ?? '/';

	const submit = useHttp({
		endpoint: login,
		onSuccess: () => navigate(from, { replace: true }),
	});

	return (
		<AuthLayout
			title="Sign in to Lumo"
			footer={
				<>
					Don't have an account?{' '}
					<Button
						variant="link"
						className="h-auto p-0"
						nativeButton={false}
						render={<Link to="/register" />}
					>
						Sign up now
					</Button>
				</>
			}
		>
			{/* The same schema the API validates with — one rule, two runtimes. */}
			<Form className="gap-6" schema={loginSchema} onSubmit={submit.fetchData}>
				<Field name="email">
					<Input type="email" autoComplete="username" placeholder="Email" aria-label="Email" />
				</Field>

				<Field name="password">
					<Input
						type="password"
						autoComplete="current-password"
						placeholder="Password"
						aria-label="Password"
					/>
				</Field>

				<Button type="submit" loading={submit.loading} className="mt-2 w-full">
					Sign in
				</Button>
			</Form>
		</AuthLayout>
	);
};
