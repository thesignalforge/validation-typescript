/**
 * Check if a value is considered "empty" for validation purposes.
 *
 * Empty values:
 * - null
 * - undefined
 * - empty string ''
 * - empty array []
 * - string with only whitespace (trimmed to empty)
 *
 * NOT empty:
 * - 0 (zero)
 * - false
 * - empty object {} (considered not empty for validation)
 */
export function isEmpty(value: unknown): boolean {
    if (value === null || value === undefined) {
        return true;
    }

    if (typeof value === 'string') {
        return value.trim() === '';
    }

    if (Array.isArray(value)) {
        return value.length === 0;
    }

    return false;
}

/**
 * Check if a value is considered "filled" (not empty).
 */
export function isFilled(value: unknown): boolean {
    return !isEmpty(value);
}
