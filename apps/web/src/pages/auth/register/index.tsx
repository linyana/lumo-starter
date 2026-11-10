import { registerSchema, type RegisterInput } from '@lumo/shared';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button, Field, Form, type FormErrors, Input } from '@/components';
import { errorFields, toFormErrors, toastError } from '@/lib';
import { useHttp } from '@/hooks';
import { useAuth } from '@/providers/auth';
import { AuthLayout } from '@/providers/layout';

export const RegisterPage = () => {
	const { register } = useAuth();
	const navigate = useNavigate();
	const [errors, setErrors] = useState<FormErrors>({});

	const submit = useHttp(register, {
		onSuccess: () => navigate('/', { replace: true }),
		onError: (error) => {
			const fields = errorFields(error);
			if (Object.keys(fields).length > 0) setErrors(fields);
			else toastError(error.message);
		},
	});

	const handleSubmit = (values: Record<string, unknown>): void => {
		const parsed = registerSchema.safeParse(values);
		if (!parsed.success) {
			setErrors(toFormErrors(parsed.error));
			return;
		}

		setErrors({});
		void submit.fetchData(parsed.data as RegisterInput);
	};

	return (
		<AuthLayout
			title="Create account"
			description="The first account becomes the owner; later ones join as members."
			footer={
				<>
					Already have an account?{' '}
					<Button
						variant="link"
						className="h-auto p-0"
						nativeButton={false}
						render={<Link to="/login" />}
					>
						Sign in now
					</Button>
				</>
			}
		>
			<Form errors={errors} onFormSubmit={handleSubmit}>
				<Field name="email" label="Email">
					<Input type="email" autoComplete="email" />
				</Field>

				<Field name="name" label="Display name">
					<Input autoComplete="name" />
				</Field>

				<Field
					name="password"
					label="Password"
					description="At least 8 characters, mixing letters and numbers."
				>
					<Input type="password" autoComplete="new-password" />
				</Field>

				<Field name="confirmPassword" label="Confirm password">
					<Input type="password" autoComplete="new-password" />
				</Field>

				<Button type="submit" loading={submit.loading} className="mt-2 w-full">
					Create account
				</Button>
			</Form>
		</AuthLayout>
	);
};
