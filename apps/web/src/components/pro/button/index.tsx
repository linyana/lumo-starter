import { LumoButton } from '@/components/ui/button';
import type { ButtonProps } from './types';

export const Button = ({ children, ...props }: ButtonProps) => {
	return (
    <LumoButton {...props}>
			{children}
		</LumoButton>
	);
};
