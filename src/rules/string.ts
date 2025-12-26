import type { RuleHandler, ValidationError } from '../types';

/**
 * Minimum length/value/count depending on type.
 */
export const minRule: RuleHandler = {
    name: 'min',

    validate(value, params, _data, field): ValidationError | null {
        const [min] = params as [number];

        if (typeof value === 'string') {
            // Check if the string is a numeric value
            const numericValue = parseFloat(value);
            if (!isNaN(numericValue) && isFinite(numericValue) && /^-?\d*\.?\d+$/.test(value.trim())) {
                // Treat as numeric comparison
                if (numericValue < min) {
                    return {
                        key: 'validation.min.numeric',
                        params: { field, min, actual: numericValue },
                    };
                }
            } else {
                // Treat as string length comparison
                if (value.length < min) {
                    return {
                        key: 'validation.min.string',
                        params: { field, min, actual: value.length },
                    };
                }
            }
        } else if (typeof value === 'number') {
            if (value < min) {
                return {
                    key: 'validation.min.numeric',
                    params: { field, min, actual: value },
                };
            }
        } else if (Array.isArray(value)) {
            if (value.length < min) {
                return {
                    key: 'validation.min.array',
                    params: { field, min, actual: value.length },
                };
            }
        }

        return null;
    },
};

/**
 * Maximum length/value/count depending on type.
 */
export const maxRule: RuleHandler = {
    name: 'max',

    validate(value, params, _data, field): ValidationError | null {
        const [max] = params as [number];

        if (typeof value === 'string') {
            // Check if the string is a numeric value
            const numericValue = parseFloat(value);
            if (!isNaN(numericValue) && isFinite(numericValue) && /^-?\d*\.?\d+$/.test(value.trim())) {
                // Treat as numeric comparison
                if (numericValue > max) {
                    return {
                        key: 'validation.max.numeric',
                        params: { field, max, actual: numericValue },
                    };
                }
            } else {
                // Treat as string length comparison
                if (value.length > max) {
                    return {
                        key: 'validation.max.string',
                        params: { field, max, actual: value.length },
                    };
                }
            }
        } else if (typeof value === 'number') {
            if (value > max) {
                return {
                    key: 'validation.max.numeric',
                    params: { field, max, actual: value },
                };
            }
        } else if (Array.isArray(value)) {
            if (value.length > max) {
                return {
                    key: 'validation.max.array',
                    params: { field, max, actual: value.length },
                };
            }
        }

        return null;
    },
};

/**
 * Length/value/count must be between min and max.
 */
export const betweenRule: RuleHandler = {
    name: 'between',

    validate(value, params, _data, field): ValidationError | null {
        const [min, max] = params as [number, number];

        if (typeof value === 'string') {
            // Check if the string is a numeric value
            const numericValue = parseFloat(value);
            if (!isNaN(numericValue) && isFinite(numericValue) && /^-?\d*\.?\d+$/.test(value.trim())) {
                // Treat as numeric comparison
                if (numericValue < min || numericValue > max) {
                    return {
                        key: 'validation.between.numeric',
                        params: { field, min, max, actual: numericValue },
                    };
                }
            } else {
                // Treat as string length comparison
                if (value.length < min || value.length > max) {
                    return {
                        key: 'validation.between.string',
                        params: { field, min, max, actual: value.length },
                    };
                }
            }
        } else if (typeof value === 'number') {
            if (value < min || value > max) {
                return {
                    key: 'validation.between.numeric',
                    params: { field, min, max, actual: value },
                };
            }
        } else if (Array.isArray(value)) {
            if (value.length < min || value.length > max) {
                return {
                    key: 'validation.between.array',
                    params: { field, min, max, actual: value.length },
                };
            }
        }

        return null;
    },
};

/**
 * Must match the given regular expression.
 */
export const regexRule: RuleHandler = {
    name: 'regex',

    validate(value, params, _data, field): ValidationError | null {
        if (typeof value !== 'string') {
            return {
                key: 'validation.regex',
                params: { field },
            };
        }

        const [pattern] = params as [RegExp | string];
        const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);

        if (!regex.test(value)) {
            return {
                key: 'validation.regex',
                params: { field },
            };
        }

        return null;
    },
};

/**
 * Must NOT match the given regular expression.
 */
export const notRegexRule: RuleHandler = {
    name: 'not_regex',

    validate(value, params, _data, field): ValidationError | null {
        if (typeof value !== 'string') {
            return null;
        }

        const [pattern] = params as [RegExp | string];
        const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);

        if (regex.test(value)) {
            return {
                key: 'validation.not_regex',
                params: { field },
            };
        }

        return null;
    },
};

/**
 * Only alphabetic characters.
 */
export const alphaRule: RuleHandler = {
    name: 'alpha',

    validate(value, _params, _data, field): ValidationError | null {
        if (typeof value !== 'string' || !/^[a-zA-Z]+$/.test(value)) {
            return {
                key: 'validation.alpha',
                params: { field },
            };
        }
        return null;
    },
};

/**
 * Only alphanumeric characters.
 */
export const alphaNumRule: RuleHandler = {
    name: 'alpha_num',

    validate(value, _params, _data, field): ValidationError | null {
        if (typeof value !== 'string' || !/^[a-zA-Z0-9]+$/.test(value)) {
            return {
                key: 'validation.alpha_num',
                params: { field },
            };
        }
        return null;
    },
};

/**
 * Alphanumeric, dashes, and underscores.
 */
export const alphaDashRule: RuleHandler = {
    name: 'alpha_dash',

    validate(value, _params, _data, field): ValidationError | null {
        if (typeof value !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(value)) {
            return {
                key: 'validation.alpha_dash',
                params: { field },
            };
        }
        return null;
    },
};

/**
 * Must be lowercase.
 */
export const lowercaseRule: RuleHandler = {
    name: 'lowercase',

    validate(value, _params, _data, field): ValidationError | null {
        if (typeof value !== 'string' || value !== value.toLowerCase()) {
            return {
                key: 'validation.lowercase',
                params: { field },
            };
        }
        return null;
    },
};

/**
 * Must be uppercase.
 */
export const uppercaseRule: RuleHandler = {
    name: 'uppercase',

    validate(value, _params, _data, field): ValidationError | null {
        if (typeof value !== 'string' || value !== value.toUpperCase()) {
            return {
                key: 'validation.uppercase',
                params: { field },
            };
        }
        return null;
    },
};

/**
 * Must start with the given prefix.
 */
export const startsWithRule: RuleHandler = {
    name: 'starts_with',

    validate(value, params, _data, field): ValidationError | null {
        if (typeof value !== 'string') {
            return {
                key: 'validation.starts_with',
                params: { field, prefix: String(params[0]) },
            };
        }

        const prefixes = Array.isArray(params[0]) ? params[0] as string[] : [params[0] as string];

        if (!prefixes.some(prefix => value.startsWith(prefix))) {
            return {
                key: 'validation.starts_with',
                params: { field, prefix: prefixes.join(', ') },
            };
        }

        return null;
    },
};

/**
 * Must end with the given suffix.
 */
export const endsWithRule: RuleHandler = {
    name: 'ends_with',

    validate(value, params, _data, field): ValidationError | null {
        if (typeof value !== 'string') {
            return {
                key: 'validation.ends_with',
                params: { field, suffix: String(params[0]) },
            };
        }

        const suffixes = Array.isArray(params[0]) ? params[0] as string[] : [params[0] as string];

        if (!suffixes.some(suffix => value.endsWith(suffix))) {
            return {
                key: 'validation.ends_with',
                params: { field, suffix: suffixes.join(', ') },
            };
        }

        return null;
    },
};

/**
 * Must contain the given substring.
 */
export const containsRule: RuleHandler = {
    name: 'contains',

    validate(value, params, _data, field): ValidationError | null {
        if (typeof value !== 'string') {
            return {
                key: 'validation.contains',
                params: { field, substring: String(params[0]) },
            };
        }

        const substrings = Array.isArray(params[0]) ? params[0] as string[] : [params[0] as string];

        if (!substrings.some(substring => value.includes(substring))) {
            return {
                key: 'validation.contains',
                params: { field, substring: substrings.join(', ') },
            };
        }

        return null;
    },
};
