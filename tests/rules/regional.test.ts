import { describe, it, expect } from 'vitest';
import { Validator } from '../../src';

describe('regional rules', () => {
    describe('oib rule', () => {
        const validator = new Validator({
            oib: ['oib'],
        });

        const validOibs = [
            '69435151530', // Example valid OIB
            '94abortin56',  // Will fail format
        ];

        it('passes for valid OIB', () => {
            // Known valid OIBs for testing
            const result = validator.validate({ oib: '69435151530' });
            expect(result.valid).toBe(true);
        });

        it('fails for invalid checksum', () => {
            const result = validator.validate({ oib: '12345678901' });
            expect(result.valid).toBe(false);
            expect(result.errors.oib[0].key).toBe('validation.oib');
        });

        it('fails for wrong length', () => {
            expect(validator.validate({ oib: '1234567890' }).valid).toBe(false);
            expect(validator.validate({ oib: '123456789012' }).valid).toBe(false);
        });

        it('fails for non-numeric', () => {
            expect(validator.validate({ oib: '1234567890a' }).valid).toBe(false);
        });

        it('skips validation for empty value', () => {
            expect(validator.validate({ oib: '' }).valid).toBe(true);
        });
    });

    describe('iban rule', () => {
        const validator = new Validator({
            iban: ['iban'],
        });

        it('passes for valid Croatian IBAN', () => {
            const result = validator.validate({ iban: 'HR1210010051863000160' });
            expect(result.valid).toBe(true);
        });

        it('passes for valid German IBAN', () => {
            const result = validator.validate({ iban: 'DE89370400440532013000' });
            expect(result.valid).toBe(true);
        });

        it('passes for IBAN with spaces', () => {
            const result = validator.validate({ iban: 'DE89 3704 0044 0532 0130 00' });
            expect(result.valid).toBe(true);
        });

        it('fails for invalid checksum', () => {
            const result = validator.validate({ iban: 'DE89370400440532013001' });
            expect(result.valid).toBe(false);
        });

        it('fails for wrong country length', () => {
            const result = validator.validate({ iban: 'HR12100100518630001' });
            expect(result.valid).toBe(false);
        });

        it('validates country-specific IBAN', () => {
            const hrValidator = new Validator({
                iban: [['iban', 'HR']],
            });

            expect(hrValidator.validate({ iban: 'HR1210010051863000160' }).valid).toBe(true);
            expect(hrValidator.validate({ iban: 'DE89370400440532013000' }).valid).toBe(false);
        });
    });

    describe('phone rule', () => {
        const validator = new Validator({
            phone: ['phone'],
        });

        it('passes for international format', () => {
            expect(validator.validate({ phone: '+385981234567' }).valid).toBe(true);
        });

        it('passes for phone with spaces', () => {
            expect(validator.validate({ phone: '+385 98 123 4567' }).valid).toBe(true);
        });

        it('fails for invalid phone', () => {
            expect(validator.validate({ phone: '123' }).valid).toBe(false);
        });

        it('validates country-specific phone', () => {
            const hrValidator = new Validator({
                phone: [['phone', 'HR']],
            });

            expect(hrValidator.validate({ phone: '0981234567' }).valid).toBe(true);
            expect(hrValidator.validate({ phone: '+385981234567' }).valid).toBe(true);
        });
    });

    describe('vat_eu rule', () => {
        const validator = new Validator({
            vat: ['vat_eu'],
        });

        it('passes for valid Croatian VAT', () => {
            const result = validator.validate({ vat: 'HR69435151530' });
            expect(result.valid).toBe(true);
        });

        it('passes for valid German VAT', () => {
            const result = validator.validate({ vat: 'DE123456789' });
            expect(result.valid).toBe(true);
        });

        it('fails for invalid format', () => {
            expect(validator.validate({ vat: 'INVALID123' }).valid).toBe(false);
        });

        it('fails for non-EU country', () => {
            expect(validator.validate({ vat: 'US123456789' }).valid).toBe(false);
        });

        it('handles lowercase input', () => {
            const result = validator.validate({ vat: 'de123456789' });
            expect(result.valid).toBe(true);
        });
    });
});
