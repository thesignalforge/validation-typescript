import type { RuleHandler, ValidationError } from '../types';
import { get } from '../utils/get';

/**
 * Must be one of the given values.
 */
export const inRule: RuleHandler = {
    name: 'in',

    validate(value, params, _data, field): ValidationError | null {
        const allowedValues = Array.isArray(params[0]) ? params[0] : params;

        if (!allowedValues.includes(value)) {
            return {
                key: 'validation.in',
                params: { field, values: (allowedValues as unknown[]).join(', ') },
            };
        }

        return null;
    },
};

/**
 * Must NOT be one of the given values.
 */
export const notInRule: RuleHandler = {
    name: 'not_in',

    validate(value, params, _data, field): ValidationError | null {
        const disallowedValues = Array.isArray(params[0]) ? params[0] : params;

        if (disallowedValues.includes(value)) {
            return {
                key: 'validation.not_in',
                params: { field, values: (disallowedValues as unknown[]).join(', ') },
            };
        }

        return null;
    },
};

/**
 * Must match another field's value.
 */
export const sameRule: RuleHandler = {
    name: 'same',

    validate(value, params, data, field): ValidationError | null {
        const [otherField] = params as [string];
        const otherValue = get(data, otherField);

        if (value !== otherValue) {
            return {
                key: 'validation.same',
                params: { field, other: otherField },
            };
        }

        return null;
    },
};

/**
 * Must be different from another field's value.
 */
export const differentRule: RuleHandler = {
    name: 'different',

    validate(value, params, data, field): ValidationError | null {
        const [otherField] = params as [string];
        const otherValue = get(data, otherField);

        if (value === otherValue) {
            return {
                key: 'validation.different',
                params: { field, other: otherField },
            };
        }

        return null;
    },
};

/**
 * Must match {field}_confirmation.
 */
export const confirmedRule: RuleHandler = {
    name: 'confirmed',

    validate(value, _params, data, field): ValidationError | null {
        const confirmationField = `${field}_confirmation`;
        const confirmationValue = get(data, confirmationField);

        if (value !== confirmationValue) {
            return {
                key: 'validation.confirmed',
                params: { field },
            };
        }

        return null;
    },
};
