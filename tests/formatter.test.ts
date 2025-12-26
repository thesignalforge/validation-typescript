import { describe, it, expect } from 'vitest';
import { Validator, MessageFormatter, defaultMessages, type Rules } from '../src';

describe('MessageFormatter', () => {
    const messages = {
        en: defaultMessages,
        hr: {
            'validation.required': 'Polje {field} je obavezno.',
            'validation.min.string': 'Polje {field} mora imati najmanje {min} znakova.',
            'validation.email': 'Polje {field} mora biti ispravna email adresa.',
        },
    };

    describe('basic formatting', () => {
        it('formats errors with English messages', () => {
            const rules: Rules = {
                name: ['required'],
            };

            const validator = new Validator(rules);
            const result = validator.validate({ name: '' });

            const formatter = new MessageFormatter(messages, 'en');
            const formatted = formatter.format(result);

            expect(formatted.name).toHaveLength(1);
            expect(formatted.name[0]).toBe('The name field is required.');
        });

        it('formats errors with Croatian messages', () => {
            const rules: Rules = {
                name: ['required'],
            };

            const validator = new Validator(rules);
            const result = validator.validate({ name: '' });

            const formatter = new MessageFormatter(messages, 'hr');
            const formatted = formatter.format(result);

            expect(formatted.name).toHaveLength(1);
            expect(formatted.name[0]).toBe('Polje name je obavezno.');
        });

        it('interpolates parameters', () => {
            const rules: Rules = {
                name: ['required', 'string', ['min', 5]],
            };

            const validator = new Validator(rules);
            const result = validator.validate({ name: 'Jo' });

            const formatter = new MessageFormatter(messages, 'en');
            const formatted = formatter.format(result);

            expect(formatted.name[0]).toBe('The name must be at least 5 characters.');
        });
    });

    describe('field labels', () => {
        it('uses custom field labels', () => {
            const rules: Rules = {
                email: ['required'],
            };

            const validator = new Validator(rules);
            const result = validator.validate({ email: '' });

            const formatter = new MessageFormatter(messages, 'en', {
                labels: {
                    email: 'Email Address',
                },
            });
            const formatted = formatter.format(result);

            expect(formatted.email[0]).toBe('The Email Address field is required.');
        });

        it('uses wildcard labels for array items', () => {
            const rules: Rules = {
                'items.*.name': ['required'],
            };

            const validator = new Validator(rules);
            const result = validator.validate({
                items: [{ name: '' }],
            });

            const formatter = new MessageFormatter(messages, 'en', {
                labels: {
                    'items.*.name': 'Item Name',
                },
            });
            const formatted = formatter.format(result);

            expect(formatted['items.0.name'][0]).toBe('The Item Name field is required.');
        });
    });

    describe('locale management', () => {
        it('changes locale', () => {
            const formatter = new MessageFormatter(messages, 'en');
            expect(formatter.getLocale()).toBe('en');

            formatter.setLocale('hr');
            expect(formatter.getLocale()).toBe('hr');
        });

        it('falls back to default locale', () => {
            const rules: Rules = {
                email: ['email'],
            };

            const validator = new Validator(rules);
            const result = validator.validate({ email: 'invalid' });

            // German locale with English fallback
            const formatter = new MessageFormatter(messages, 'de', {
                defaultLocale: 'en',
            });
            const formatted = formatter.format(result);

            // Should use English message
            expect(formatted.email[0]).toBe('The email must be a valid email address.');
        });

        it('returns key when no message found', () => {
            const rules: Rules = {
                custom: ['required'],
            };

            const emptyMessages = { en: {} };
            const formatter = new MessageFormatter(emptyMessages, 'en');

            const result = { valid: false, errors: { custom: [{ key: 'validation.custom', params: { field: 'custom' } }] }, validated: {} };
            const formatted = formatter.format(result);

            expect(formatted.custom[0]).toBe('validation.custom');
        });
    });

    describe('message management', () => {
        it('adds messages dynamically', () => {
            const formatter = new MessageFormatter({ en: {} }, 'en');
            formatter.addMessages('en', {
                'validation.required': 'This field is required.',
            });

            const result = { valid: false, errors: { name: [{ key: 'validation.required', params: { field: 'name' } }] }, validated: {} };
            const formatted = formatter.format(result);

            expect(formatted.name[0]).toBe('This field is required.');
        });

        it('sets labels dynamically', () => {
            const formatter = new MessageFormatter(messages, 'en');
            formatter.setLabels({
                email: 'Your Email',
            });

            const result = { valid: false, errors: { email: [{ key: 'validation.required', params: { field: 'email' } }] }, validated: {} };
            const formatted = formatter.format(result);

            expect(formatted.email[0]).toBe('The Your Email field is required.');
        });
    });

    describe('format single error', () => {
        it('formats a single error', () => {
            const formatter = new MessageFormatter(messages, 'en');
            const error = { key: 'validation.email', params: { field: 'email' } };

            const formatted = formatter.formatError(error, 'email');
            expect(formatted).toBe('The email must be a valid email address.');
        });
    });
});
