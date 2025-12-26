import type { RuleHandler, ValidationError } from '../types';
import { get } from '../utils/get';

/**
 * Get numeric value from input.
 */
function getNumericValue(value: unknown): number | null {
    if (typeof value === 'number') {
        return isFinite(value) ? value : null;
    }
    if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isFinite(parsed) ? parsed : null;
    }
    return null;
}

/**
 * Greater than another field.
 */
export const gtRule: RuleHandler = {
    name: 'gt',

    validate(value, params, data, field): ValidationError | null {
        const [otherField] = params as [string];
        const currentValue = getNumericValue(value);
        const otherValue = getNumericValue(get(data, otherField));

        if (currentValue === null || otherValue === null) {
            return {
                key: 'validation.gt.numeric',
                params: { field, other: otherField },
            };
        }

        if (currentValue <= otherValue) {
            return {
                key: 'validation.gt.numeric',
                params: { field, other: otherField, value: otherValue },
            };
        }

        return null;
    },
};

/**
 * Greater than or equal to another field.
 */
export const gteRule: RuleHandler = {
    name: 'gte',

    validate(value, params, data, field): ValidationError | null {
        const [otherField] = params as [string];
        const currentValue = getNumericValue(value);
        const otherValue = getNumericValue(get(data, otherField));

        if (currentValue === null || otherValue === null) {
            return {
                key: 'validation.gte.numeric',
                params: { field, other: otherField },
            };
        }

        if (currentValue < otherValue) {
            return {
                key: 'validation.gte.numeric',
                params: { field, other: otherField, value: otherValue },
            };
        }

        return null;
    },
};

/**
 * Less than another field.
 */
export const ltRule: RuleHandler = {
    name: 'lt',

    validate(value, params, data, field): ValidationError | null {
        const [otherField] = params as [string];
        const currentValue = getNumericValue(value);
        const otherValue = getNumericValue(get(data, otherField));

        if (currentValue === null || otherValue === null) {
            return {
                key: 'validation.lt.numeric',
                params: { field, other: otherField },
            };
        }

        if (currentValue >= otherValue) {
            return {
                key: 'validation.lt.numeric',
                params: { field, other: otherField, value: otherValue },
            };
        }

        return null;
    },
};

/**
 * Less than or equal to another field.
 */
export const lteRule: RuleHandler = {
    name: 'lte',

    validate(value, params, data, field): ValidationError | null {
        const [otherField] = params as [string];
        const currentValue = getNumericValue(value);
        const otherValue = getNumericValue(get(data, otherField));

        if (currentValue === null || otherValue === null) {
            return {
                key: 'validation.lte.numeric',
                params: { field, other: otherField },
            };
        }

        if (currentValue > otherValue) {
            return {
                key: 'validation.lte.numeric',
                params: { field, other: otherField, value: otherValue },
            };
        }

        return null;
    },
};
