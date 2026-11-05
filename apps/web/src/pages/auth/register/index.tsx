import { registerSchema, type RegisterInput } from '@lumo/shared';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Form, type FormErrors } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
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
					Already registered? <Link to="/login">Sign in</Link>
				</>
			}
		>
			<Form errors={errors} onFormSubmit={handleSubmit}>
				<Field.Root name="email">
					<Field.Label>Email</Field.Label>
					<Field.Control render={<Input type="email" autoComplete="email" />} />
					<Field.Error />
				</Field.Root>

				<Field.Root name="name">
					<Field.Label>Display name</Field.Label>
					<Field.Control render={<Input autoComplete="name" />} />
					<Field.Error />
				</Field.Root>

				<Field.Root name="password">
					<Field.Label>Password</Field.Label>
					<Field.Description>At least 8 characters, mixing letters and numbers.</Field.Description>
					<Field.Control render={<Input type="password" autoComplete="new-password" />} />
					<Field.Error />
				</Field.Root>

				<Field.Root name="confirmPassword">
					<Field.Label>Confirm password</Field.Label>
					<Field.Control render={<Input type="password" autoComplete="new-password" />} />
					<Field.Error />
				</Field.Root>

				<Button type="submit" loading={submit.loading} className="mt-2 w-full">
					Create account
				</Button>
			</Form>
		</AuthLayout>
	);
};
