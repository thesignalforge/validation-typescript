/**
 * Get a value from a nested object using dot notation.
 *
 * @param data - The object to get the value from
 * @param path - Dot-notation path (e.g., 'user.address.city')
 * @returns The value at the path, or undefined if not found
 */
export function get(data: Record<string, unknown>, path: string): unknown {
    if (!path) {
        return undefined;
    }

    const parts = path.split('.');
    let current: unknown = data;

    for (const part of parts) {
        if (current === null || current === undefined) {
            return undefined;
        }

        if (typeof current !== 'object') {
            return undefined;
        }

        current = (current as Record<string, unknown>)[part];
    }

    return current;
}

/**
 * Set a value in a nested object using dot notation.
 *
 * @param data - The object to set the value in
 * @param path - Dot-notation path (e.g., 'user.address.city')
 * @param value - The value to set
 */
export function set(data: Record<string, unknown>, path: string, value: unknown): void {
    if (!path) {
        return;
    }

    const parts = path.split('.');
    let current: Record<string, unknown> = data;

    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!(part in current) || typeof current[part] !== 'object' || current[part] === null) {
            // Check if next part is numeric (array index)
            const nextPart = parts[i + 1];
            current[part] = /^\d+$/.test(nextPart) ? [] : {};
        }
        current = current[part] as Record<string, unknown>;
    }

    current[parts[parts.length - 1]] = value;
}
