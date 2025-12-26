import type { RuleHandler, ValidationError } from '../types';

/**
 * Croatian OIB (Personal Identification Number).
 * Uses ISO 7064, MOD 11-10 algorithm.
 */
export const oibRule: RuleHandler = {
    name: 'oib',

    validate(value, _params, _data, field): ValidationError | null {
        if (typeof value !== 'string') {
            return { key: 'validation.oib', params: { field } };
        }

        if (!/^\d{11}$/.test(value)) {
            return { key: 'validation.oib', params: { field } };
        }

        // ISO 7064, MOD 11-10
        let t = 10;
        for (let i = 0; i < 10; i++) {
            t = (parseInt(value[i], 10) + t) % 10;
            if (t === 0) t = 10;
            t = (t * 2) % 11;
        }

        const control = (11 - t) % 10;
        if (control !== parseInt(value[10], 10)) {
            return { key: 'validation.oib', params: { field } };
        }

        return null;
    },
};

// Phone number patterns by country
const PHONE_PATTERNS: Record<string, RegExp> = {
    HR: /^(?:\+385|00385|0)?[1-9]\d{6,9}$/,
    SI: /^(?:\+386|00386|0)?[1-9]\d{6,8}$/,
    AT: /^(?:\+43|0043|0)?[1-9]\d{6,13}$/,
    DE: /^(?:\+49|0049|0)?[1-9]\d{6,14}$/,
    US: /^(?:\+1|001)?[2-9]\d{9}$/,
    GB: /^(?:\+44|0044|0)?[1-9]\d{9,10}$/,
};

// Default international phone pattern
const INTERNATIONAL_PHONE = /^\+?[1-9]\d{6,14}$/;

/**
 * Must be a valid phone number.
 */
export const phoneRule: RuleHandler = {
    name: 'phone',

    validate(value, params, _data, field): ValidationError | null {
        if (typeof value !== 'string') {
            return { key: 'validation.phone', params: { field } };
        }

        // Remove spaces, dashes, parentheses
        const cleaned = value.replace(/[\s\-()]/g, '');

        const country = params[0] as string | undefined;

        if (country && PHONE_PATTERNS[country]) {
            if (!PHONE_PATTERNS[country].test(cleaned)) {
                return { key: 'validation.phone', params: { field, country } };
            }
        } else {
            if (!INTERNATIONAL_PHONE.test(cleaned)) {
                return { key: 'validation.phone', params: { field } };
            }
        }

        return null;
    },
};

// IBAN country lengths
const IBAN_LENGTHS: Record<string, number> = {
    AL: 28, AD: 24, AT: 20, AZ: 28, BH: 22, BE: 16, BA: 20, BR: 29, BG: 22,
    CR: 22, HR: 21, CY: 28, CZ: 24, DK: 18, DO: 28, EE: 20, FO: 18, FI: 18,
    FR: 27, GE: 22, DE: 22, GI: 23, GR: 27, GL: 18, GT: 28, HU: 28, IS: 26,
    IE: 22, IL: 23, IT: 27, JO: 30, KZ: 20, XK: 20, KW: 30, LV: 21, LB: 28,
    LI: 21, LT: 20, LU: 20, MK: 19, MT: 31, MR: 27, MU: 30, MC: 27, MD: 24,
    ME: 22, NL: 18, NO: 15, PK: 24, PS: 29, PL: 28, PT: 25, QA: 29, RO: 24,
    SM: 27, SA: 24, RS: 22, SK: 24, SI: 19, ES: 24, SE: 24, CH: 21, TN: 24,
    TR: 26, AE: 23, GB: 22, VG: 24,
};

/**
 * Must be a valid IBAN.
 */
export const ibanRule: RuleHandler = {
    name: 'iban',

    validate(value, params, _data, field): ValidationError | null {
        if (typeof value !== 'string') {
            return { key: 'validation.iban', params: { field } };
        }

        // Remove spaces and convert to uppercase
        const iban = value.replace(/\s/g, '').toUpperCase();

        // Check basic format
        if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(iban)) {
            return { key: 'validation.iban', params: { field } };
        }

        const countryCode = iban.slice(0, 2);

        // Check country-specific length
        const expectedLength = IBAN_LENGTHS[countryCode];
        if (!expectedLength || iban.length !== expectedLength) {
            return { key: 'validation.iban', params: { field } };
        }

        // If country param provided, check it matches
        const requiredCountry = params[0] as string | undefined;
        if (requiredCountry && countryCode !== requiredCountry.toUpperCase()) {
            return { key: 'validation.iban', params: { field, country: requiredCountry } };
        }

        // Validate checksum using MOD 97
        // Move first 4 chars to end, replace letters with numbers
        const rearranged = iban.slice(4) + iban.slice(0, 4);
        const numeric = rearranged.replace(/[A-Z]/g, char =>
            (char.charCodeAt(0) - 55).toString()
        );

        // Calculate MOD 97 (handle big numbers by processing in chunks)
        let remainder = 0;
        for (let i = 0; i < numeric.length; i++) {
            remainder = (remainder * 10 + parseInt(numeric[i], 10)) % 97;
        }

        if (remainder !== 1) {
            return { key: 'validation.iban', params: { field } };
        }

        return null;
    },
};

// EU VAT patterns by country
const VAT_PATTERNS: Record<string, RegExp> = {
    AT: /^ATU\d{8}$/,
    BE: /^BE[01]\d{9}$/,
    BG: /^BG\d{9,10}$/,
    CY: /^CY\d{8}[A-Z]$/,
    CZ: /^CZ\d{8,10}$/,
    DE: /^DE\d{9}$/,
    DK: /^DK\d{8}$/,
    EE: /^EE\d{9}$/,
    EL: /^EL\d{9}$/,
    ES: /^ES[A-Z0-9]\d{7}[A-Z0-9]$/,
    FI: /^FI\d{8}$/,
    FR: /^FR[A-Z0-9]{2}\d{9}$/,
    HR: /^HR\d{11}$/,
    HU: /^HU\d{8}$/,
    IE: /^IE(\d{7}[A-Z]{1,2}|\d[A-Z+*]\d{5}[A-Z])$/,
    IT: /^IT\d{11}$/,
    LT: /^LT(\d{9}|\d{12})$/,
    LU: /^LU\d{8}$/,
    LV: /^LV\d{11}$/,
    MT: /^MT\d{8}$/,
    NL: /^NL\d{9}B\d{2}$/,
    PL: /^PL\d{10}$/,
    PT: /^PT\d{9}$/,
    RO: /^RO\d{2,10}$/,
    SE: /^SE\d{12}$/,
    SI: /^SI\d{8}$/,
    SK: /^SK\d{10}$/,
};

/**
 * Must be a valid EU VAT number.
 */
export const vatEuRule: RuleHandler = {
    name: 'vat_eu',

    validate(value, _params, _data, field): ValidationError | null {
        if (typeof value !== 'string') {
            return { key: 'validation.vat_eu', params: { field } };
        }

        // Remove spaces and convert to uppercase
        const vat = value.replace(/\s/g, '').toUpperCase();

        // Extract country code
        const countryCode = vat.slice(0, 2);

        // Check if it's an EU country
        const pattern = VAT_PATTERNS[countryCode];
        if (!pattern) {
            return { key: 'validation.vat_eu', params: { field } };
        }

        // Check format
        if (!pattern.test(vat)) {
            return { key: 'validation.vat_eu', params: { field } };
        }

        // For Croatian VAT (which is OIB), also validate the checksum
        if (countryCode === 'HR') {
            const oib = vat.slice(2);
            let t = 10;
            for (let i = 0; i < 10; i++) {
                t = (parseInt(oib[i], 10) + t) % 10;
                if (t === 0) t = 10;
                t = (t * 2) % 11;
            }
            const control = (11 - t) % 10;
            if (control !== parseInt(oib[10], 10)) {
                return { key: 'validation.vat_eu', params: { field } };
            }
        }

        return null;
    },
};
