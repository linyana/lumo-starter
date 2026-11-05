import { loginSchema, type LoginInput } from '@lumo/shared';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Form, type FormErrors } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
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
			title="Sign in"
			description="Use one of the seeded accounts to explore the permission matrix."
			footer={
				<>
					No account? <Link to="/register">Create one</Link>
				</>
			}
		>
			<Form errors={errors} onFormSubmit={handleSubmit}>
				<Field.Root name="email">
					<Field.Label>Email</Field.Label>
					<Field.Control render={<Input type="email" autoComplete="email" />} />
					<Field.Error />
				</Field.Root>

				<Field.Root name="password">
					<Field.Label>Password</Field.Label>
					<Field.Control render={<Input type="password" autoComplete="current-password" />} />
					<Field.Error />
				</Field.Root>

				<Button type="submit" loading={submit.loading} className="mt-2 w-full">
					Sign in
				</Button>
			</Form>
		</AuthLayout>
	);
};
