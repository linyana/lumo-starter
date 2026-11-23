export const MODAL_PORTAL_KEYS = ['container', 'keepMounted'] as const;

type ModalPortalKey = (typeof MODAL_PORTAL_KEYS)[number];

/**
 * Shared prop surface for the modal overlays (dialog, alert dialog, drawer). The
 * modal facade owns the Base UI Portal / Backdrop / Viewport elements, so the
 * caller has no element of theirs to spread onto; these are the typed way in.
 * Each member is derived from the component's own Base UI types, so a Base UI
 * upgrade widens them without editing this file.
 */
export type ModalEscapeHatches<Portal, Backdrop, Viewport> = Pick<
	Portal,
	Extract<keyof Portal, ModalPortalKey>
> & {
	portalProps?: Omit<Portal, ModalPortalKey | 'children'>;
	backdropProps?: Omit<Backdrop, 'children'>;
	viewportProps?: Omit<Viewport, 'children'>;
};
