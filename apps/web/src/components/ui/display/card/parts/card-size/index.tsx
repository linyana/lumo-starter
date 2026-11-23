import type { VariantProps } from 'tailwind-variants';
import type { cardVariants } from '../root';

export type CardSize = NonNullable<VariantProps<typeof cardVariants>['size']>;
