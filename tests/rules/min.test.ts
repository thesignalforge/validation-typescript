import { describe, it, expect } from 'vitest';
import { Validator } from '../../src';

describe('min rule', () => {
    describe('string validation', () => {
        const validator = new Validator({
            name: ['string', ['min', 3]],
        });

        it('passes when string length equals min', () => {
            expect(validator.validate({ name: 'abc' }).valid).toBe(true);
        });

        it('passes when string length exceeds min', () => {
            expect(validator.validate({ name: 'abcdef' }).valid).toBe(true);
        });

        it('fails when string length is below min', () => {
            const result = validator.validate({ name: 'ab' });
            expect(result.valid).toBe(false);
            expect(result.errors.name[0].key).toBe('validation.min.string');
            expect(result.errors.name[0].params.min).toBe(3);
            expect(result.errors.name[0].params.actual).toBe(2);
        });

        it('skips validation for empty string', () => {
            expect(validator.validate({ name: '' }).valid).toBe(true);
        });
    });

    describe('numeric validation', () => {
        const validator = new Validator({
            age: ['numeric', ['min', 18]],
        });

        it('passes when number equals min', () => {
            expect(validator.validate({ age: 18 }).valid).toBe(true);
        });

        it('passes when number exceeds min', () => {
            expect(validator.validate({ age: 25 }).valid).toBe(true);
        });

        it('fails when number is below min', () => {
            const result = validator.validate({ age: 16 });
            expect(result.valid).toBe(false);
            expect(result.errors.age[0].key).toBe('validation.min.numeric');
        });

        it('handles string numbers', () => {
            expect(validator.validate({ age: '20' }).valid).toBe(true);
            expect(validator.validate({ age: '16' }).valid).toBe(false);
        });
    });

    describe('array validation', () => {
        const validator = new Validator({
            tags: ['array', ['min', 2]],
        });

        it('passes when array length equals min', () => {
            expect(validator.validate({ tags: ['a', 'b'] }).valid).toBe(true);
        });

        it('passes when array length exceeds min', () => {
            expect(validator.validate({ tags: ['a', 'b', 'c'] }).valid).toBe(true);
        });

        it('fails when array length is below min', () => {
            const result = validator.validate({ tags: ['a'] });
            expect(result.valid).toBe(false);
            expect(result.errors.tags[0].key).toBe('validation.min.array');
            expect(result.errors.tags[0].params.min).toBe(2);
            expect(result.errors.tags[0].params.actual).toBe(1);
        });
    });
});
