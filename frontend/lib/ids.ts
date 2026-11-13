let n = 0;
/** Temporary client-side id for new list items; the backend should replace it with its own id. */
export const nextLocalId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${++n}`;
