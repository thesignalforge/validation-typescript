import type { RuleHandler, ValidationError } from '../types';

/**
 * The field must be a string.
 */
export const stringRule: RuleHandler = {
    name: 'string',

    validate(value, _params, _data, field): ValidationError | null {
        if (typeof value !== 'string') {
            return {
                key: 'validation.string',
                params: { field },
            };
        }
        return null;
    },
};

/**
 * The field must be an integer.
 */
export const integerRule: RuleHandler = {
    name: 'integer',

    validate(value, _params, _data, field): ValidationError | null {
        // Accept string representations of integers
        if (typeof value === 'string') {
            const parsed = parseInt(value, 10);
            if (!isNaN(parsed) && parsed.toString() === value.trim()) {
                return null;
            }
        }

        if (typeof value === 'number' && Number.isInteger(value)) {
            return null;
        }

        return {
            key: 'validation.integer',
            params: { field },
        };
    },
};

/**
 * The field must be numeric (integer or float).
 */
export const numericRule: RuleHandler = {
    name: 'numeric',

    validate(value, _params, _data, field): ValidationError | null {
        // Accept string representations of numbers
        if (typeof value === 'string') {
            const parsed = parseFloat(value);
            if (!isNaN(parsed) && isFinite(parsed)) {
                return null;
            }
        }

        if (typeof value === 'number' && isFinite(value)) {
            return null;
        }

        return {
            key: 'validation.numeric',
            params: { field },
        };
    },
};

/**
 * The field must be a boolean or boolean-like value.
 */
export const booleanRule: RuleHandler = {
    name: 'boolean',

    validate(value, _params, _data, field): ValidationError | null {
        // Accept actual booleans
        if (typeof value === 'boolean') {
            return null;
        }

        // Accept boolean-like values
        const booleanLike = [true, false, 0, 1, '0', '1', 'true', 'false'];
        if (booleanLike.includes(value as boolean | number | string)) {
            return null;
        }

        return {
            key: 'validation.boolean',
            params: { field },
        };
    },
};

/**
 * The field must be an array.
 */
export const arrayRule: RuleHandler = {
    name: 'array',

    validate(value, _params, _data, field): ValidationError | null {
        if (!Array.isArray(value)) {
            return {
                key: 'validation.array',
                params: { field },
            };
        }
        return null;
    },
};
