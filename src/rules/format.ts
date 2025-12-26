import type { RuleHandler, ValidationError } from '../types';

// Email regex (simplified but practical)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Must be a valid email address.
 */
export const emailRule: RuleHandler = {
    name: 'email',

    validate(value, _params, _data, field): ValidationError | null {
        if (typeof value !== 'string' || !EMAIL_REGEX.test(value)) {
            return {
                key: 'validation.email',
                params: { field },
            };
        }
        return null;
    },
};

/**
 * Must be a valid URL.
 */
export const urlRule: RuleHandler = {
    name: 'url',

    validate(value, params, _data, field): ValidationError | null {
        if (typeof value !== 'string') {
            return {
                key: 'validation.url',
                params: { field },
            };
        }

        try {
            const url = new URL(value);
            const allowedSchemes = params.length > 0
                ? (Array.isArray(params[0]) ? params[0] : [params[0]]) as string[]
                : ['http', 'https'];

            const scheme = url.protocol.replace(':', '');
            if (!allowedSchemes.includes(scheme)) {
                return {
                    key: 'validation.url',
                    params: { field },
                };
            }

            return null;
        } catch {
            return {
                key: 'validation.url',
                params: { field },
            };
        }
    },
};

// IPv4 regex
const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

// IPv6 regex (simplified)
const IPV6_REGEX = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::(?:[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:){1,7}:$|^(?:[0-9a-fA-F]{1,4}:){0,6}::(?:[0-9a-fA-F]{1,4}:){0,5}[0-9a-fA-F]{1,4}$/;

/**
 * Must be a valid IP address.
 */
export const ipRule: RuleHandler = {
    name: 'ip',

    validate(value, params, _data, field): ValidationError | null {
        if (typeof value !== 'string') {
            return {
                key: 'validation.ip',
                params: { field },
            };
        }

        const version = params[0] as string | undefined;

        if (version === 'v4') {
            if (!IPV4_REGEX.test(value)) {
                return {
                    key: 'validation.ipv4',
                    params: { field },
                };
            }
        } else if (version === 'v6') {
            if (!IPV6_REGEX.test(value)) {
                return {
                    key: 'validation.ipv6',
                    params: { field },
                };
            }
        } else {
            // Either v4 or v6
            if (!IPV4_REGEX.test(value) && !IPV6_REGEX.test(value)) {
                return {
                    key: 'validation.ip',
                    params: { field },
                };
            }
        }

        return null;
    },
};

// UUID regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Must be a valid UUID.
 */
export const uuidRule: RuleHandler = {
    name: 'uuid',

    validate(value, params, _data, field): ValidationError | null {
        if (typeof value !== 'string') {
            return {
                key: 'validation.uuid',
                params: { field },
            };
        }

        const version = params[0] as number | undefined;

        if (version === 4) {
            if (!UUID_V4_REGEX.test(value)) {
                return {
                    key: 'validation.uuid',
                    params: { field },
                };
            }
        } else {
            if (!UUID_REGEX.test(value)) {
                return {
                    key: 'validation.uuid',
                    params: { field },
                };
            }
        }

        return null;
    },
};

/**
 * Must be a valid JSON string.
 */
export const jsonRule: RuleHandler = {
    name: 'json',

    validate(value, _params, _data, field): ValidationError | null {
        if (typeof value !== 'string') {
            return {
                key: 'validation.json',
                params: { field },
            };
        }

        try {
            JSON.parse(value);
            return null;
        } catch {
            return {
                key: 'validation.json',
                params: { field },
            };
        }
    },
};

/**
 * Must be a valid date.
 */
export const dateRule: RuleHandler = {
    name: 'date',

    validate(value, _params, _data, field): ValidationError | null {
        if (value instanceof Date && !isNaN(value.getTime())) {
            return null;
        }

        if (typeof value === 'string' || typeof value === 'number') {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                return null;
            }
        }

        return {
            key: 'validation.date',
            params: { field },
        };
    },
};

/**
 * Must match the given date format.
 * Supports: Y-m-d, d/m/Y, m/d/Y, Y-m-d H:i:s, ISO 8601
 */
export const dateFormatRule: RuleHandler = {
    name: 'date_format',

    validate(value, params, _data, field): ValidationError | null {
        if (typeof value !== 'string') {
            return {
                key: 'validation.date_format',
                params: { field, format: String(params[0]) },
            };
        }

        const format = params[0] as string;
        let regex: RegExp;

        switch (format) {
            case 'Y-m-d':
                regex = /^\d{4}-\d{2}-\d{2}$/;
                break;
            case 'd/m/Y':
                regex = /^\d{2}\/\d{2}\/\d{4}$/;
                break;
            case 'm/d/Y':
                regex = /^\d{2}\/\d{2}\/\d{4}$/;
                break;
            case 'Y-m-d H:i:s':
                regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
                break;
            default:
                // For other formats, just check if it's a valid date
                const date = new Date(value);
                if (isNaN(date.getTime())) {
                    return {
                        key: 'validation.date_format',
                        params: { field, format },
                    };
                }
                return null;
        }

        if (!regex.test(value)) {
            return {
                key: 'validation.date_format',
                params: { field, format },
            };
        }

        // Also verify it's a valid date
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            return {
                key: 'validation.date_format',
                params: { field, format },
            };
        }

        return null;
    },
};

/**
 * Parse date from value.
 */
function parseDate(value: unknown): Date | null {
    if (value instanceof Date) {
        return isNaN(value.getTime()) ? null : value;
    }
    if (typeof value === 'string' || typeof value === 'number') {
        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date;
    }
    return null;
}

/**
 * Must be a date after the given date.
 */
export const afterRule: RuleHandler = {
    name: 'after',

    validate(value, params, _data, field): ValidationError | null {
        const currentDate = parseDate(value);
        const afterDate = parseDate(params[0]);

        if (!currentDate || !afterDate) {
            return {
                key: 'validation.after',
                params: { field, date: String(params[0]) },
            };
        }

        if (currentDate <= afterDate) {
            return {
                key: 'validation.after',
                params: { field, date: String(params[0]) },
            };
        }

        return null;
    },
};

/**
 * Must be a date before the given date.
 */
export const beforeRule: RuleHandler = {
    name: 'before',

    validate(value, params, _data, field): ValidationError | null {
        const currentDate = parseDate(value);
        const beforeDate = parseDate(params[0]);

        if (!currentDate || !beforeDate) {
            return {
                key: 'validation.before',
                params: { field, date: String(params[0]) },
            };
        }

        if (currentDate >= beforeDate) {
            return {
                key: 'validation.before',
                params: { field, date: String(params[0]) },
            };
        }

        return null;
    },
};
