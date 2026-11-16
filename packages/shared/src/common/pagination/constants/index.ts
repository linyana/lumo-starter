/**
 * The numbers a page can hold. They are constants because three places have to agree on them and
 * none of them can ask the other: the schema the API accepts, the selector a reader picks from, and
 * the size a list opens with. Held as one range, a size the API refuses is a size nothing offers.
 */
export const PAGE_SIZE_MIN = 1;

export const PAGE_SIZE_MAX = 100;

/** The size a list opens with when neither the caller nor the address bar names one. */
export const PAGE_SIZE_DEFAULT = 10;

/** The sizes a reader is offered before they pick one — every one of them within the range above. */
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
