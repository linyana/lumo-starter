import type { VariantProps } from 'tailwind-variants';
import type { cardVariants } from '../root';

export type CardSurface = NonNullable<VariantProps<typeof cardVariants>['surface']>;
