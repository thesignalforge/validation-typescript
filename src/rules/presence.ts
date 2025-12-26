import type { RuleHandler, ValidationError } from '../types';
import { isEmpty } from '../utils/is-empty';

/**
 * The field must be present and not empty.
 */
export const requiredRule: RuleHandler = {
    name: 'required',
    skipIfEmpty: false,
    bailOnFailure: true,

    validate(value, _params, _data, field): ValidationError | null {
        if (isEmpty(value)) {
            return {
                key: 'validation.required',
                params: { field },
            };
        }
        return null;
    },
};

/**
 * The field can be null/undefined. If null/undefined, stops validation chain.
 */
export const nullableRule: RuleHandler = {
    name: 'nullable',
    skipIfEmpty: false,
    bailOnFailure: false,

    validate(_value, _params, _data, _field): ValidationError | null {
        // Nullable never fails, it's a modifier
        // The validator will check if nullable is present and value is empty
        // to skip subsequent rules
        return null;
    },
};

/**
 * If the field is present, it must not be empty.
 */
export const filledRule: RuleHandler = {
    name: 'filled',
    skipIfEmpty: false,
    bailOnFailure: true,

    validate(value, _params, _data, field): ValidationError | null {
        // If value is undefined (not present), it's fine
        if (value === undefined) {
            return null;
        }
        // If present but empty, fail
        if (isEmpty(value)) {
            return {
                key: 'validation.filled',
                params: { field },
            };
        }
        return null;
    },
};

/**
 * The field must exist in the input (can be empty).
 */
export const presentRule: RuleHandler = {
    name: 'present',
    skipIfEmpty: false,
    bailOnFailure: true,

    validate(value, _params, _data, field): ValidationError | null {
        if (value === undefined) {
            return {
                key: 'validation.present',
                params: { field },
            };
        }
        return null;
    },
};
