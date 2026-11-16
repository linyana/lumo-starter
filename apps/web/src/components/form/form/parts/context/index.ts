import { createContext } from 'react';

/**
 * The reader's arrival, as the fields inside a form share it. An input opens read-only, and `touch`
 * is what the first one reached calls; from then on they are all editable, because a browser fills a
 * form as one thing — a password arrives with its username or not at all — and a field that opened
 * by itself would be the one the other half could never reach. It is read by `Input`, which falls
 * back to a gate of its own outside a form rather than to no gate at all.
 */
export type FieldGate = { touched: boolean; touch: () => void };

export const FieldGateContext = createContext<FieldGate | null>(null);
