import { ControlSpinner } from '@/components/ui/form/loading';
import { fieldText } from '@/lib/control';
import { cn } from '@/lib/utils';
import {
	ComboboxClear,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxInputGroup,
	ComboboxItem,
	ComboboxList,
	ComboboxPopup,
	ComboboxPortal,
	ComboboxPositioner,
	ComboboxRoot,
	ComboboxTrigger,
} from './parts';
import type { ComboboxProps } from './types';

export const Combobox = ({
	items,
	value,
	defaultValue,
	onChange,
	placeholder,
	size = 'md',
	disabled = false,
	loading = false,
	name,
	empty,
	className,
	classNames,
}: ComboboxProps) => (
	<ComboboxRoot
		items={items}
		value={value}
		defaultValue={defaultValue}
		onValueChange={onChange}
		disabled={disabled || loading}
		name={name}
	>
		<ComboboxInputGroup
			className={cn(fieldText[size], className, classNames?.group)}
			data-loading={loading ? '' : undefined}
		>
			<ComboboxInput
				size={size}
				placeholder={placeholder}
				className={classNames?.input}
				data-loading={loading ? '' : undefined}
				aria-busy={loading || undefined}
				readOnly={loading || undefined}
			/>
			{loading ? (
				<ControlSpinner className="absolute inset-y-0 inset-e-0.5 text-muted-foreground" />
			) : (
				<>
					<ComboboxTrigger />
					<ComboboxClear />
				</>
			)}
		</ComboboxInputGroup>
		<ComboboxPortal>
			<ComboboxPositioner>
				<ComboboxPopup className={classNames?.popup}>
					{empty !== undefined && (
						<ComboboxEmpty className={classNames?.empty}>{empty}</ComboboxEmpty>
					)}
					<ComboboxList className={classNames?.list}>
						{(item: string) => (
							<ComboboxItem key={item} value={item} className={classNames?.item}>
								{item}
							</ComboboxItem>
						)}
					</ComboboxList>
				</ComboboxPopup>
			</ComboboxPositioner>
		</ComboboxPortal>
	</ComboboxRoot>
);
