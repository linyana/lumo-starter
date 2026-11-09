import { LumoSkeleton } from '@/components/ui/skeleton';
import type { SkeletonProps } from './types';

/** Placeholder for content that has not arrived. Give it the size the real content will be. */
export const Skeleton = ({ className }: SkeletonProps) => <LumoSkeleton className={className} />;
