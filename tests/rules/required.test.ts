import { describe, it, expect } from 'vitest';
import { Validator } from '../../src';

describe('required rule', () => {
    const validator = new Validator({
        field: ['required'],
    });

    it('passes with non-empty string', () => {
        expect(validator.validate({ field: 'value' }).valid).toBe(true);
    });

    it('passes with zero', () => {
        expect(validator.validate({ field: 0 }).valid).toBe(true);
    });

    it('passes with false', () => {
        expect(validator.validate({ field: false }).valid).toBe(true);
    });

    it('passes with array', () => {
        expect(validator.validate({ field: [1, 2, 3] }).valid).toBe(true);
    });

    it('fails with empty string', () => {
        const result = validator.validate({ field: '' });
        expect(result.valid).toBe(false);
        expect(result.errors.field[0].key).toBe('validation.required');
    });

    it('fails with whitespace-only string', () => {
        const result = validator.validate({ field: '   ' });
        expect(result.valid).toBe(false);
    });

    it('fails with null', () => {
        const result = validator.validate({ field: null });
        expect(result.valid).toBe(false);
    });

    it('fails with undefined', () => {
        const result = validator.validate({ field: undefined });
        expect(result.valid).toBe(false);
    });

    it('fails with empty array', () => {
        const result = validator.validate({ field: [] });
        expect(result.valid).toBe(false);
    });

    it('fails when field is missing', () => {
        const result = validator.validate({});
        expect(result.valid).toBe(false);
    });
});
