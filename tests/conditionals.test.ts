import { describe, it, expect } from 'vitest';
import { Validator, type Rules } from '../src';

describe('Conditional validation', () => {
    describe('field conditions', () => {
        it('applies rules when condition is met', () => {
            const rules: Rules = {
                type: ['required', ['in', ['business', 'personal']]],
                company_name: [
                    ['when', ['type', '=', 'business'], [
                        'required',
                        'string',
                        ['max', 200],
                    ]],
                ],
            };

            const validator = new Validator(rules);

            // Business type requires company_name
            const result1 = validator.validate({
                type: 'business',
                company_name: '',
            });
            expect(result1.valid).toBe(false);
            expect(result1.errors.company_name).toBeDefined();

            // Personal type doesn't require company_name
            const result2 = validator.validate({
                type: 'personal',
                company_name: '',
            });
            expect(result2.valid).toBe(true);
        });

        it('applies different rules based on condition', () => {
            const rules: Rules = {
                category: ['required'],
                document_type: [
                    'required',
                    ['when', ['category', '=', 'legal'],
                        [['in', ['contract', 'nda', 'agreement']]],
                        [['in', ['report', 'memo', 'note']]],
                    ],
                ],
            };

            const validator = new Validator(rules);

            // Legal category
            expect(validator.validate({
                category: 'legal',
                document_type: 'contract',
            }).valid).toBe(true);

            expect(validator.validate({
                category: 'legal',
                document_type: 'memo',
            }).valid).toBe(false);

            // Other category
            expect(validator.validate({
                category: 'general',
                document_type: 'memo',
            }).valid).toBe(true);

            expect(validator.validate({
                category: 'general',
                document_type: 'contract',
            }).valid).toBe(false);
        });
    });

    describe('self-referential conditions', () => {
        it('applies rules based on field value length', () => {
            const rules: Rules = {
                bio: [
                    'nullable',
                    'string',
                    ['when', ['@length', '>=', 256], [
                        ['max', 65535],
                    ]],
                ],
            };

            const validator = new Validator(rules);

            // Short bio - no max constraint
            expect(validator.validate({ bio: 'Short bio' }).valid).toBe(true);

            // Long bio - max constraint applies (but within limit)
            const longBio = 'a'.repeat(1000);
            expect(validator.validate({ bio: longBio }).valid).toBe(true);
        });

        it('applies rules when field is filled', () => {
            const rules: Rules = {
                bio: [
                    'nullable',
                    'string',
                    ['when', ['@filled'], [
                        ['min', 10],
                    ]],
                ],
            };

            const validator = new Validator(rules);

            // Empty - no min constraint
            expect(validator.validate({ bio: '' }).valid).toBe(true);
            expect(validator.validate({ bio: null }).valid).toBe(true);

            // Filled but too short
            expect(validator.validate({ bio: 'Short' }).valid).toBe(false);

            // Filled and long enough
            expect(validator.validate({ bio: 'Long enough bio' }).valid).toBe(true);
        });

        it('applies rules based on field type', () => {
            const rules: Rules = {
                value: [
                    ['when', ['@type', 'string'], [
                        ['min', 5],
                    ]],
                ],
            };

            const validator = new Validator(rules);

            // String value - min applies
            expect(validator.validate({ value: 'abc' }).valid).toBe(false);
            expect(validator.validate({ value: 'abcdef' }).valid).toBe(true);

            // Number value - min doesn't apply
            expect(validator.validate({ value: 123 }).valid).toBe(true);
        });

        it('applies rules based on regex match', () => {
            const rules: Rules = {
                code: [
                    'required',
                    ['when', ['@matches', /^[A-Z]/], [
                        ['min', 5],
                    ]],
                ],
            };

            const validator = new Validator(rules);

            // Starts with uppercase - min applies
            expect(validator.validate({ code: 'ABC' }).valid).toBe(false);
            expect(validator.validate({ code: 'ABCDEF' }).valid).toBe(true);

            // Starts with lowercase - min doesn't apply
            expect(validator.validate({ code: 'abc' }).valid).toBe(true);
        });
    });

    describe('compound conditions', () => {
        it('validates with AND conditions', () => {
            const rules: Rules = {
                type: ['required'],
                country: ['required'],
                vat_number: [
                    ['when', ['and', ['type', '=', 'business'], ['country', 'in', ['HR', 'SI', 'AT']]], [
                        'required',
                    ]],
                ],
            };

            const validator = new Validator(rules);

            // Business + EU country = required
            expect(validator.validate({
                type: 'business',
                country: 'HR',
                vat_number: '',
            }).valid).toBe(false);

            // Business + non-EU country = not required
            expect(validator.validate({
                type: 'business',
                country: 'US',
                vat_number: '',
            }).valid).toBe(true);

            // Personal + EU country = not required
            expect(validator.validate({
                type: 'personal',
                country: 'HR',
                vat_number: '',
            }).valid).toBe(true);
        });

        it('validates with OR conditions', () => {
            const rules: Rules = {
                role: ['required'],
                admin_code: [
                    ['when', ['or', ['role', '=', 'admin'], ['role', '=', 'superadmin']], [
                        'required',
                    ]],
                ],
            };

            const validator = new Validator(rules);

            // Admin requires code
            expect(validator.validate({
                role: 'admin',
                admin_code: '',
            }).valid).toBe(false);

            // Superadmin requires code
            expect(validator.validate({
                role: 'superadmin',
                admin_code: '',
            }).valid).toBe(false);

            // User doesn't require code
            expect(validator.validate({
                role: 'user',
                admin_code: '',
            }).valid).toBe(true);
        });
    });

    describe('comparison operators', () => {
        it('validates with != operator', () => {
            const rules: Rules = {
                status: ['required'],
                reason: [
                    ['when', ['status', '!=', 'approved'], [
                        'required',
                    ]],
                ],
            };

            const validator = new Validator(rules);

            expect(validator.validate({
                status: 'rejected',
                reason: '',
            }).valid).toBe(false);

            expect(validator.validate({
                status: 'approved',
                reason: '',
            }).valid).toBe(true);
        });

        it('validates with numeric comparisons', () => {
            const rules: Rules = {
                quantity: ['required', 'integer'],
                discount: [
                    ['when', ['quantity', '>=', 10], [
                        'required',
                        'numeric',
                    ]],
                ],
            };

            const validator = new Validator(rules);

            // Quantity >= 10 requires discount
            expect(validator.validate({
                quantity: 10,
                discount: '',
            }).valid).toBe(false);

            expect(validator.validate({
                quantity: 10,
                discount: 0.15,
            }).valid).toBe(true);

            // Quantity < 10 doesn't require discount
            expect(validator.validate({
                quantity: 5,
                discount: '',
            }).valid).toBe(true);
        });

        it('validates with filled/empty operators', () => {
            const rules: Rules = {
                email: ['nullable'],
                email_verified: [
                    ['when', ['email', 'filled'], [
                        'required',
                        'boolean',
                    ]],
                ],
            };

            const validator = new Validator(rules);

            // Email filled requires verification
            expect(validator.validate({
                email: 'test@example.com',
                email_verified: undefined,
            }).valid).toBe(false);

            // Email empty doesn't require verification
            expect(validator.validate({
                email: '',
                email_verified: undefined,
            }).valid).toBe(true);
        });
    });
});
