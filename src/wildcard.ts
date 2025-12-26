import { get } from './utils/get';

/**
 * Expand wildcard patterns in field paths.
 *
 * For example, 'items.*.name' with data { items: [{name: 'a'}, {name: 'b'}] }
 * would expand to: Map { 'items.0.name' => 'a', 'items.1.name' => 'b' }
 */
export function expandWildcards(
    pattern: string,
    data: Record<string, unknown>
): Map<string, unknown> {
    const result = new Map<string, unknown>();

    if (!pattern.includes('*')) {
        result.set(pattern, get(data, pattern));
        return result;
    }

    const parts = pattern.split('.');
    expandRecursive(parts, 0, data, '', result);

    return result;
}

function expandRecursive(
    parts: string[],
    index: number,
    current: unknown,
    path: string,
    result: Map<string, unknown>
): void {
    if (index >= parts.length) {
        // Remove leading dot
        result.set(path.slice(1), current);
        return;
    }

    const part = parts[index];

    if (part === '*') {
        if (Array.isArray(current)) {
            current.forEach((item, i) => {
                expandRecursive(parts, index + 1, item, `${path}.${i}`, result);
            });
        } else if (current && typeof current === 'object') {
            Object.entries(current as Record<string, unknown>).forEach(([key, value]) => {
                expandRecursive(parts, index + 1, value, `${path}.${key}`, result);
            });
        }
    } else {
        const next = current && typeof current === 'object'
            ? (current as Record<string, unknown>)[part]
            : undefined;
        expandRecursive(parts, index + 1, next, `${path}.${part}`, result);
    }
}

/**
 * Check if a field path is a wildcard pattern.
 */
export function isWildcardPattern(path: string): boolean {
    return path.includes('*');
}

/**
 * Get the base path before the first wildcard.
 * E.g., 'items.*.name' => 'items'
 */
export function getWildcardBasePath(pattern: string): string {
    const idx = pattern.indexOf('*');
    if (idx === -1) return pattern;
    if (idx === 0) return '';
    // Remove trailing dot
    return pattern.slice(0, idx - 1);
}
