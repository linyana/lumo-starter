import { loginSchema, type LoginInput } from '@lumo/shared';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { LumoButton } from '@/components/ui/button';
import { LumoField } from '@/components/ui/field';
import { LumoForm, type FormErrors } from '@/components/ui/form';
import { LumoInput } from '@/components/ui/input';
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

	const submit = useHttp(login, {
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
		void submit.fetchData(parsed.data as LoginInput);
	};

	return (
		<AuthLayout
			title="Sign in to Lumo"
			footer={
				<>
					Don't have an account?{' '}
					<LumoButton
						variant="link"
						className="h-auto p-0"
						nativeButton={false}
						render={<Link to="/register" />}
					>
						Sign up now
					</LumoButton>
				</>
			}
		>
			<LumoForm className="gap-6" errors={errors} onFormSubmit={handleSubmit}>
				<LumoField.Root name="email">
					<LumoField.Control
						render={
							<LumoInput
								type="email"
								autoComplete="username"
								placeholder="Email"
								aria-label="Email"
							/>
						}
					/>
					<LumoField.Error />
				</LumoField.Root>

				<LumoField.Root name="password">
					<LumoField.Control
						render={
							<LumoInput
								type="password"
								autoComplete="current-password"
								placeholder="Password"
								aria-label="Password"
							/>
						}
					/>
					<LumoField.Error />
				</LumoField.Root>

				<LumoButton type="submit" loading={submit.loading} className="mt-2 w-full">
					Sign in
				</LumoButton>
			</LumoForm>
		</AuthLayout>
	);
};
