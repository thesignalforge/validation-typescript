import type { RuleHandler, ValidationError } from '../types';

/**
 * All array items must be unique (distinct).
 */
export const distinctRule: RuleHandler = {
    name: 'distinct',

    validate(value, _params, _data, field): ValidationError | null {
        if (!Array.isArray(value)) {
            return null;
        }

        const seen = new Set();
        for (const item of value) {
            // Use JSON.stringify for object comparison
            const key = typeof item === 'object' && item !== null
                ? JSON.stringify(item)
                : item;

            if (seen.has(key)) {
                return {
                    key: 'validation.distinct',
                    params: { field },
                };
            }
            seen.add(key);
        }

        return null;
    },
};
