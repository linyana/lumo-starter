import { loginSchema, type LoginInput } from '@lumo/shared';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Button, Field, Form, type FormErrors, Input } from '@/components';
import { errorFields, toFormErrors, toastError } from '@/lib';
import { useHttp } from '@/hooks';
import { useAuth } from '@/providers/auth';
import { AuthLayout } from '@/providers/layout';

export const LoginPage = () => {
	const { login } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const [errors, setErrors] = useState<FormErrors>({});

	const from = (location.state as { from?: string } | null)?.from ?? '/';

	const submit = useHttp({
		fn: login,
		onSuccess: () => navigate(from, { replace: true }),
		// A verdict about a field belongs under it; anything else — wrong password,
		// an unreachable server — has no field to sit under, so it takes the toast.
		onError: (error) => {
			const fields = errorFields(error);
			if (Object.keys(fields).length > 0) setErrors(fields);
			else toastError(error.message);
		},
	});

	const handleSubmit = (values: Record<string, unknown>): void => {
		// The same schema the API validates with — one rule, two runtimes.
		const parsed = loginSchema.safeParse(values);
		if (!parsed.success) {
			setErrors(toFormErrors(parsed.error));
			return;
		}

		setErrors({});
		submit.fetchData(parsed.data as LoginInput);
	};

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
			<Form className="gap-6" errors={errors} onFormSubmit={handleSubmit}>
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
