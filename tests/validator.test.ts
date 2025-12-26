import { describe, it, expect } from 'vitest';
import { Validator, type Rules } from '../src';

describe('Validator', () => {
    describe('basic validation', () => {
        it('validates required fields', () => {
            const rules: Rules = {
                name: ['required'],
            };

            const validator = new Validator(rules);

            const result1 = validator.validate({ name: 'John' });
            expect(result1.valid).toBe(true);
            expect(result1.validated).toEqual({ name: 'John' });

            const result2 = validator.validate({ name: '' });
            expect(result2.valid).toBe(false);
            expect(result2.errors.name).toHaveLength(1);
            expect(result2.errors.name[0].key).toBe('validation.required');
        });

        it('validates multiple rules', () => {
            const rules: Rules = {
                email: ['required', 'email'],
                name: ['required', 'string', ['min', 2], ['max', 100]],
            };

            const validator = new Validator(rules);

            const result = validator.validate({
                email: 'user@example.com',
                name: 'John',
            });

            expect(result.valid).toBe(true);
        });

        it('returns errors for invalid data', () => {
            const rules: Rules = {
                email: ['required', 'email'],
                name: ['required', 'string', ['min', 2]],
            };

            const validator = new Validator(rules);

            const result = validator.validate({
                email: 'invalid-email',
                name: 'J',
            });

            expect(result.valid).toBe(false);
            expect(result.errors.email).toHaveLength(1);
            expect(result.errors.name).toHaveLength(1);
        });
    });

    describe('static make method', () => {
        it('validates using static factory', () => {
            const result = Validator.make(
                { email: 'test@example.com' },
                { email: ['required', 'email'] }
            );

            expect(result.valid).toBe(true);
        });
    });

    describe('nullable fields', () => {
        it('allows null/undefined for nullable fields', () => {
            const rules: Rules = {
                age: ['nullable', 'integer'],
            };

            const validator = new Validator(rules);

            const result1 = validator.validate({ age: null });
            expect(result1.valid).toBe(true);

            const result2 = validator.validate({ age: undefined });
            expect(result2.valid).toBe(true);

            const result3 = validator.validate({ age: 25 });
            expect(result3.valid).toBe(true);
        });

        it('validates non-null values for nullable fields', () => {
            const rules: Rules = {
                age: ['nullable', 'integer'],
            };

            const validator = new Validator(rules);

            const result = validator.validate({ age: 'not-a-number' });
            expect(result.valid).toBe(false);
        });
    });

    describe('parameterized rules', () => {
        it('validates min length', () => {
            const rules: Rules = {
                name: ['required', 'string', ['min', 3]],
            };

            const validator = new Validator(rules);

            const result1 = validator.validate({ name: 'Jo' });
            expect(result1.valid).toBe(false);
            expect(result1.errors.name[0].params.min).toBe(3);

            const result2 = validator.validate({ name: 'John' });
            expect(result2.valid).toBe(true);
        });

        it('validates between', () => {
            const rules: Rules = {
                age: ['required', 'integer', ['between', 18, 120]],
            };

            const validator = new Validator(rules);

            expect(validator.validate({ age: 17 }).valid).toBe(false);
            expect(validator.validate({ age: 18 }).valid).toBe(true);
            expect(validator.validate({ age: 50 }).valid).toBe(true);
            expect(validator.validate({ age: 120 }).valid).toBe(true);
            expect(validator.validate({ age: 121 }).valid).toBe(false);
        });

        it('validates regex', () => {
            const rules: Rules = {
                slug: ['required', 'string', ['regex', /^[a-z0-9-]+$/]],
            };

            const validator = new Validator(rules);

            expect(validator.validate({ slug: 'valid-slug-123' }).valid).toBe(true);
            expect(validator.validate({ slug: 'Invalid Slug!' }).valid).toBe(false);
        });
    });

    describe('nested fields', () => {
        it('validates nested object fields', () => {
            const rules: Rules = {
                'user.name': ['required', 'string'],
                'user.email': ['required', 'email'],
            };

            const validator = new Validator(rules);

            const result = validator.validate({
                user: {
                    name: 'John',
                    email: 'john@example.com',
                },
            });

            expect(result.valid).toBe(true);
        });
    });

    describe('array validation with wildcards', () => {
        it('validates array items', () => {
            const rules: Rules = {
                tags: ['required', 'array', ['min', 1]],
                'tags.*': ['required', 'string', ['max', 50]],
            };

            const validator = new Validator(rules);

            const result1 = validator.validate({
                tags: ['javascript', 'typescript'],
            });
            expect(result1.valid).toBe(true);

            const result2 = validator.validate({
                tags: ['valid', ''],
            });
            expect(result2.valid).toBe(false);
            expect(result2.errors['tags.1']).toBeDefined();
        });

        it('validates nested array items', () => {
            const rules: Rules = {
                'items.*.name': ['required', 'string'],
                'items.*.quantity': ['required', 'integer', ['min', 1]],
            };

            const validator = new Validator(rules);

            const result = validator.validate({
                items: [
                    { name: 'Item 1', quantity: 5 },
                    { name: 'Item 2', quantity: 0 },
                ],
            });

            expect(result.valid).toBe(false);
            expect(result.errors['items.1.quantity']).toBeDefined();
        });
    });

    describe('type inference', () => {
        it('returns typed validated data', () => {
            interface UserForm {
                email: string;
                name: string;
                age: number | null;
            }

            const validator = new Validator<UserForm>({
                email: ['required', 'email'],
                name: ['required', 'string', ['min', 2]],
                age: ['nullable', 'integer'],
            });

            const result = validator.validate({
                email: 'user@example.com',
                name: 'John',
                age: 25,
            });

            if (result.valid) {
                // TypeScript should infer these types
                const { email, name, age } = result.validated;
                expect(typeof email).toBe('string');
                expect(typeof name).toBe('string');
                expect(typeof age).toBe('number');
            }
        });
    });
});
