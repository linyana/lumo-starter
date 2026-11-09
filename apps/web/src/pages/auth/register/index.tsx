import { registerSchema, type RegisterInput } from '@lumo/shared';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { LumoButton } from '@/components/ui/button';
import { LumoField } from '@/components/ui/field';
import { LumoForm, type FormErrors } from '@/components/ui/form';
import { LumoInput } from '@/components/ui/input';
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
					<LumoButton
						variant="link"
						className="h-auto p-0"
						nativeButton={false}
						render={<Link to="/login" />}
					>
						Sign in now
					</LumoButton>
				</>
			}
		>
			<LumoForm errors={errors} onFormSubmit={handleSubmit}>
				<LumoField.Root name="email">
					<LumoField.Label>Email</LumoField.Label>
					<LumoField.Control render={<LumoInput type="email" autoComplete="email" />} />
					<LumoField.Error />
				</LumoField.Root>

				<LumoField.Root name="name">
					<LumoField.Label>Display name</LumoField.Label>
					<LumoField.Control render={<LumoInput autoComplete="name" />} />
					<LumoField.Error />
				</LumoField.Root>

				<LumoField.Root name="password">
					<LumoField.Label>Password</LumoField.Label>
					<LumoField.Description>
						At least 8 characters, mixing letters and numbers.
					</LumoField.Description>
					<LumoField.Control render={<LumoInput type="password" autoComplete="new-password" />} />
					<LumoField.Error />
				</LumoField.Root>

				<LumoField.Root name="confirmPassword">
					<LumoField.Label>Confirm password</LumoField.Label>
					<LumoField.Control render={<LumoInput type="password" autoComplete="new-password" />} />
					<LumoField.Error />
				</LumoField.Root>

				<LumoButton type="submit" loading={submit.loading} className="mt-2 w-full">
					Create account
				</LumoButton>
			</LumoForm>
		</AuthLayout>
	);
};
