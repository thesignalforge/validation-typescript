import { describe, it, expect } from 'vitest';
import { Validator } from '../../src';

describe('email rule', () => {
    const validator = new Validator({
        email: ['email'],
    });

    const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.com',
        'user@subdomain.example.com',
        'user@example.co.uk',
        'user123@example.com',
        'USER@EXAMPLE.COM',
    ];

    const invalidEmails = [
        'plaintext',
        '@example.com',
        'user@',
        'user@.',
        'user@.com',
        'user@example.',
        'user name@example.com',
        'user@exam ple.com',
    ];

    for (const email of validEmails) {
        it(`passes for valid email: ${email}`, () => {
            expect(validator.validate({ email }).valid).toBe(true);
        });
    }

    for (const email of invalidEmails) {
        it(`fails for invalid email: ${email}`, () => {
            const result = validator.validate({ email });
            expect(result.valid).toBe(false);
            expect(result.errors.email[0].key).toBe('validation.email');
        });
    }

    it('skips validation for empty value', () => {
        expect(validator.validate({ email: '' }).valid).toBe(true);
        expect(validator.validate({ email: null }).valid).toBe(true);
    });

    it('fails for non-string value', () => {
        expect(validator.validate({ email: 123 }).valid).toBe(false);
    });
});
