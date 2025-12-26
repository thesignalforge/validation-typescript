import type { ValidationResult, ValidationError } from './types';

export interface FormatterOptions {
    labels?: Record<string, string>;
    defaultLocale?: string;
}

/**
 * Message formatter for converting validation errors to human-readable messages.
 */
export class MessageFormatter {
    constructor(
        private messages: Record<string, Record<string, string>>,
        private locale: string = 'en',
        private options: FormatterOptions = {}
    ) {}

    /**
     * Format all validation errors to messages.
     */
    format(result: ValidationResult): Record<string, string[]> {
        const formatted: Record<string, string[]> = {};

        for (const [field, errors] of Object.entries(result.errors)) {
            formatted[field] = errors.map(error => this.formatError(error, field));
        }

        return formatted;
    }

    /**
     * Format a single validation error.
     */
    formatError(error: ValidationError, field: string): string {
        // Get message template
        const template =
            this.messages[this.locale]?.[error.key] ??
            this.messages[this.options.defaultLocale ?? 'en']?.[error.key] ??
            error.key;

        // Get field label
        const fieldLabel = this.getFieldLabel(field);

        // Build params with field label
        const params = {
            ...error.params,
            field: fieldLabel,
        };

        return this.interpolate(template, params);
    }

    /**
     * Get the display label for a field.
     */
    private getFieldLabel(field: string): string {
        // Check exact match first
        if (this.options.labels?.[field]) {
            return this.options.labels[field];
        }

        // Check for wildcard pattern match
        // e.g., 'items.0.name' should match 'items.*.name'
        for (const [pattern, label] of Object.entries(this.options.labels ?? {})) {
            if (pattern.includes('*')) {
                const regex = new RegExp(
                    '^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '[^.]+') + '$'
                );
                if (regex.test(field)) {
                    return label;
                }
            }
        }

        // Default to field name
        return field;
    }

    /**
     * Interpolate placeholders in a template.
     */
    private interpolate(template: string, params: Record<string, unknown>): string {
        return template.replace(/\{(\w+)\}/g, (_, key) =>
            params[key]?.toString() ?? `{${key}}`
        );
    }

    /**
     * Set the current locale.
     */
    setLocale(locale: string): void {
        this.locale = locale;
    }

    /**
     * Get the current locale.
     */
    getLocale(): string {
        return this.locale;
    }

    /**
     * Add or update messages for a locale.
     */
    addMessages(locale: string, messages: Record<string, string>): void {
        if (!this.messages[locale]) {
            this.messages[locale] = {};
        }
        Object.assign(this.messages[locale], messages);
    }

    /**
     * Set field labels.
     */
    setLabels(labels: Record<string, string>): void {
        this.options.labels = { ...this.options.labels, ...labels };
    }
}

/**
 * Default English messages for built-in rules.
 */
export const defaultMessages: Record<string, string> = {
    'validation.required': 'The {field} field is required.',
    'validation.filled': 'The {field} field must have a value when present.',
    'validation.present': 'The {field} field must be present.',

    'validation.string': 'The {field} must be a string.',
    'validation.integer': 'The {field} must be an integer.',
    'validation.numeric': 'The {field} must be a number.',
    'validation.boolean': 'The {field} must be true or false.',
    'validation.array': 'The {field} must be an array.',

    'validation.min.string': 'The {field} must be at least {min} characters.',
    'validation.min.numeric': 'The {field} must be at least {min}.',
    'validation.min.array': 'The {field} must have at least {min} items.',

    'validation.max.string': 'The {field} must not be greater than {max} characters.',
    'validation.max.numeric': 'The {field} must not be greater than {max}.',
    'validation.max.array': 'The {field} must not have more than {max} items.',

    'validation.between.string': 'The {field} must be between {min} and {max} characters.',
    'validation.between.numeric': 'The {field} must be between {min} and {max}.',
    'validation.between.array': 'The {field} must have between {min} and {max} items.',

    'validation.regex': 'The {field} format is invalid.',
    'validation.not_regex': 'The {field} format is invalid.',
    'validation.alpha': 'The {field} must only contain letters.',
    'validation.alpha_num': 'The {field} must only contain letters and numbers.',
    'validation.alpha_dash': 'The {field} must only contain letters, numbers, dashes, and underscores.',
    'validation.lowercase': 'The {field} must be lowercase.',
    'validation.uppercase': 'The {field} must be uppercase.',
    'validation.starts_with': 'The {field} must start with one of the following: {prefix}.',
    'validation.ends_with': 'The {field} must end with one of the following: {suffix}.',
    'validation.contains': 'The {field} must contain: {substring}.',

    'validation.gt.numeric': 'The {field} must be greater than {other}.',
    'validation.gte.numeric': 'The {field} must be greater than or equal to {other}.',
    'validation.lt.numeric': 'The {field} must be less than {other}.',
    'validation.lte.numeric': 'The {field} must be less than or equal to {other}.',

    'validation.distinct': 'The {field} field has a duplicate value.',

    'validation.email': 'The {field} must be a valid email address.',
    'validation.url': 'The {field} must be a valid URL.',
    'validation.ip': 'The {field} must be a valid IP address.',
    'validation.ipv4': 'The {field} must be a valid IPv4 address.',
    'validation.ipv6': 'The {field} must be a valid IPv6 address.',
    'validation.uuid': 'The {field} must be a valid UUID.',
    'validation.json': 'The {field} must be a valid JSON string.',
    'validation.date': 'The {field} is not a valid date.',
    'validation.date_format': 'The {field} does not match the format {format}.',
    'validation.after': 'The {field} must be a date after {date}.',
    'validation.before': 'The {field} must be a date before {date}.',

    'validation.in': 'The selected {field} is invalid.',
    'validation.not_in': 'The selected {field} is invalid.',
    'validation.same': 'The {field} and {other} must match.',
    'validation.different': 'The {field} and {other} must be different.',
    'validation.confirmed': 'The {field} confirmation does not match.',

    'validation.oib': 'The {field} must be a valid Croatian OIB.',
    'validation.phone': 'The {field} must be a valid phone number.',
    'validation.iban': 'The {field} must be a valid IBAN.',
    'validation.vat_eu': 'The {field} must be a valid EU VAT number.',
};
