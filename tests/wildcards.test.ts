import { describe, it, expect } from 'vitest';
import { expandWildcards, isWildcardPattern, getWildcardBasePath } from '../src/wildcard';

describe('Wildcard expansion', () => {
    describe('expandWildcards', () => {
        it('returns single entry for non-wildcard patterns', () => {
            const data = { name: 'John' };
            const result = expandWildcards('name', data);

            expect(result.size).toBe(1);
            expect(result.get('name')).toBe('John');
        });

        it('expands array wildcards', () => {
            const data = {
                tags: ['javascript', 'typescript', 'nodejs'],
            };
            const result = expandWildcards('tags.*', data);

            expect(result.size).toBe(3);
            expect(result.get('tags.0')).toBe('javascript');
            expect(result.get('tags.1')).toBe('typescript');
            expect(result.get('tags.2')).toBe('nodejs');
        });

        it('expands nested array wildcards', () => {
            const data = {
                items: [
                    { name: 'Item 1', quantity: 5 },
                    { name: 'Item 2', quantity: 10 },
                ],
            };

            const nameResult = expandWildcards('items.*.name', data);
            expect(nameResult.size).toBe(2);
            expect(nameResult.get('items.0.name')).toBe('Item 1');
            expect(nameResult.get('items.1.name')).toBe('Item 2');

            const qtyResult = expandWildcards('items.*.quantity', data);
            expect(qtyResult.size).toBe(2);
            expect(qtyResult.get('items.0.quantity')).toBe(5);
            expect(qtyResult.get('items.1.quantity')).toBe(10);
        });

        it('expands object wildcards', () => {
            const data = {
                translations: {
                    en: 'Hello',
                    hr: 'Bok',
                    de: 'Hallo',
                },
            };
            const result = expandWildcards('translations.*', data);

            expect(result.size).toBe(3);
            expect(result.get('translations.en')).toBe('Hello');
            expect(result.get('translations.hr')).toBe('Bok');
            expect(result.get('translations.de')).toBe('Hallo');
        });

        it('expands deeply nested wildcards', () => {
            const data = {
                users: [
                    {
                        addresses: [
                            { city: 'Zagreb' },
                            { city: 'Split' },
                        ],
                    },
                    {
                        addresses: [
                            { city: 'Rijeka' },
                        ],
                    },
                ],
            };
            const result = expandWildcards('users.*.addresses.*.city', data);

            expect(result.size).toBe(3);
            expect(result.get('users.0.addresses.0.city')).toBe('Zagreb');
            expect(result.get('users.0.addresses.1.city')).toBe('Split');
            expect(result.get('users.1.addresses.0.city')).toBe('Rijeka');
        });

        it('returns empty map for non-existent paths', () => {
            const data = { name: 'John' };
            const result = expandWildcards('items.*', data);

            expect(result.size).toBe(0);
        });

        it('handles empty arrays', () => {
            const data = { items: [] };
            const result = expandWildcards('items.*', data);

            expect(result.size).toBe(0);
        });
    });

    describe('isWildcardPattern', () => {
        it('returns true for wildcard patterns', () => {
            expect(isWildcardPattern('items.*')).toBe(true);
            expect(isWildcardPattern('items.*.name')).toBe(true);
            expect(isWildcardPattern('*.name')).toBe(true);
        });

        it('returns false for non-wildcard patterns', () => {
            expect(isWildcardPattern('name')).toBe(false);
            expect(isWildcardPattern('user.name')).toBe(false);
            expect(isWildcardPattern('items.0.name')).toBe(false);
        });
    });

    describe('getWildcardBasePath', () => {
        it('returns base path before wildcard', () => {
            expect(getWildcardBasePath('items.*')).toBe('items');
            expect(getWildcardBasePath('items.*.name')).toBe('items');
            expect(getWildcardBasePath('users.*.addresses.*.city')).toBe('users');
        });

        it('returns empty string for leading wildcard', () => {
            expect(getWildcardBasePath('*.name')).toBe('');
            expect(getWildcardBasePath('*')).toBe('');
        });

        it('returns full path for non-wildcard patterns', () => {
            expect(getWildcardBasePath('name')).toBe('name');
            expect(getWildcardBasePath('user.name')).toBe('user.name');
        });
    });
});
