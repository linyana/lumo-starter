import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** clsx + tailwind-merge. Local copy so the library installs into any project. */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
