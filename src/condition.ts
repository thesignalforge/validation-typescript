import type { Condition, SelfCondition, FieldCondition, ComparisonOp } from './types';
import { get } from './utils/get';
import { isEmpty } from './utils/is-empty';

/**
 * Evaluate a condition against the current value and all data.
 */
export function evaluateCondition(
    condition: Condition,
    currentValue: unknown,
    allData: Record<string, unknown>,
    _currentField: string
): boolean {
    // Compound conditions
    if (condition[0] === 'and') {
        return (condition.slice(1) as Condition[]).every(c =>
            evaluateCondition(c, currentValue, allData, _currentField)
        );
    }

    if (condition[0] === 'or') {
        return (condition.slice(1) as Condition[]).some(c =>
            evaluateCondition(c, currentValue, allData, _currentField)
        );
    }

    // Self-referential conditions
    if (typeof condition[0] === 'string' && condition[0].startsWith('@')) {
        return evaluateSelfCondition(condition as SelfCondition, currentValue);
    }

    // Field conditions
    return evaluateFieldCondition(condition as FieldCondition, allData);
}

/**
 * Evaluate a self-referential condition.
 */
function evaluateSelfCondition(condition: SelfCondition, value: unknown): boolean {
    const [subject] = condition;

    switch (subject) {
        case '@empty':
            return isEmpty(value);

        case '@filled':
            return !isEmpty(value);

        case '@length': {
            const [, op, expected] = condition as ['@length', ComparisonOp, number];
            const len = typeof value === 'string'
                ? value.length
                : Array.isArray(value)
                    ? value.length
                    : 0;
            return compare(len, op, expected);
        }

        case '@value': {
            const [, op, expected] = condition as ['@value', '=' | '!=', unknown];
            return compare(value, op, expected);
        }

        case '@type': {
            const [, expected] = condition as ['@type', string];
            if (expected === 'array') {
                return Array.isArray(value);
            }
            return typeof value === expected;
        }

        case '@matches': {
            const [, pattern] = condition as ['@matches', RegExp | string];
            if (typeof value !== 'string') return false;
            const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
            return regex.test(value);
        }

        default:
            return false;
    }
}

/**
 * Evaluate a field condition against all data.
 */
function evaluateFieldCondition(condition: FieldCondition, data: Record<string, unknown>): boolean {
    const [field, op] = condition;
    const value = get(data, field);

    switch (op) {
        case 'filled':
            return !isEmpty(value);
        case 'empty':
            return isEmpty(value);
        case 'in': {
            const [, , expected] = condition as [string, 'in', unknown[]];
            return (expected as unknown[]).includes(value);
        }
        case 'not_in': {
            const [, , expected] = condition as [string, 'not_in', unknown[]];
            return !(expected as unknown[]).includes(value);
        }
        default: {
            const [, , expected] = condition as [string, ComparisonOp, unknown];
            return compare(value, op as ComparisonOp, expected);
        }
    }
}

/**
 * Compare two values using a comparison operator.
 */
function compare(a: unknown, op: string, b: unknown): boolean {
    switch (op) {
        case '=':
            return a === b;
        case '!=':
            return a !== b;
        case '>':
            return (a as number) > (b as number);
        case '>=':
            return (a as number) >= (b as number);
        case '<':
            return (a as number) < (b as number);
        case '<=':
            return (a as number) <= (b as number);
        default:
            return false;
    }
}
