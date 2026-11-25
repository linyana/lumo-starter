export const MODAL_PORTAL_KEYS = ['container', 'keepMounted'] as const;

type ModalPortalKey = (typeof MODAL_PORTAL_KEYS)[number];

export type ModalEscapeHatches<Portal, Backdrop, Viewport> = Pick<
	Portal,
	Extract<keyof Portal, ModalPortalKey>
> & {
	portalProps?: Omit<Portal, ModalPortalKey | 'children'>;
	backdropProps?: Omit<Backdrop, 'children'>;
	viewportProps?: Omit<Viewport, 'children'>;
};
