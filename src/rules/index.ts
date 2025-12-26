import type { RuleHandler } from '../types';

// Presence rules
import { requiredRule, nullableRule, filledRule, presentRule } from './presence';

// Type check rules
import { stringRule, integerRule, numericRule, booleanRule, arrayRule } from './type-checks';

// String rules
import {
    minRule,
    maxRule,
    betweenRule,
    regexRule,
    notRegexRule,
    alphaRule,
    alphaNumRule,
    alphaDashRule,
    lowercaseRule,
    uppercaseRule,
    startsWithRule,
    endsWithRule,
    containsRule,
} from './string';

// Numeric rules
import { gtRule, gteRule, ltRule, lteRule } from './numeric';

// Array rules
import { distinctRule } from './array';

// Format rules
import {
    emailRule,
    urlRule,
    ipRule,
    uuidRule,
    jsonRule,
    dateRule,
    dateFormatRule,
    afterRule,
    beforeRule,
} from './format';

// Comparison rules
import { inRule, notInRule, sameRule, differentRule, confirmedRule } from './comparison';

// Regional rules
import { oibRule, phoneRule, ibanRule, vatEuRule } from './regional';

/**
 * Rule registry - maps rule names to their handlers.
 */
const ruleRegistry = new Map<string, RuleHandler>();

// Register all built-in rules
const builtInRules: RuleHandler[] = [
    // Presence
    requiredRule,
    nullableRule,
    filledRule,
    presentRule,

    // Type checks
    stringRule,
    integerRule,
    numericRule,
    booleanRule,
    arrayRule,

    // String
    minRule,
    maxRule,
    betweenRule,
    regexRule,
    notRegexRule,
    alphaRule,
    alphaNumRule,
    alphaDashRule,
    lowercaseRule,
    uppercaseRule,
    startsWithRule,
    endsWithRule,
    containsRule,

    // Numeric
    gtRule,
    gteRule,
    ltRule,
    lteRule,

    // Array
    distinctRule,

    // Format
    emailRule,
    urlRule,
    ipRule,
    uuidRule,
    jsonRule,
    dateRule,
    dateFormatRule,
    afterRule,
    beforeRule,

    // Comparison
    inRule,
    notInRule,
    sameRule,
    differentRule,
    confirmedRule,

    // Regional
    oibRule,
    phoneRule,
    ibanRule,
    vatEuRule,
];

for (const rule of builtInRules) {
    ruleRegistry.set(rule.name, rule);
}

/**
 * Get a rule handler by name.
 */
export function getRule(name: string): RuleHandler | undefined {
    return ruleRegistry.get(name);
}

/**
 * Check if a rule exists.
 */
export function hasRule(name: string): boolean {
    return ruleRegistry.has(name);
}

/**
 * Register a custom rule.
 */
export function registerRule(handler: RuleHandler): void {
    ruleRegistry.set(handler.name, handler);
}

/**
 * Get all registered rule names.
 */
export function getRuleNames(): string[] {
    return Array.from(ruleRegistry.keys());
}

// Export individual rules for tree-shaking
export {
    // Presence
    requiredRule,
    nullableRule,
    filledRule,
    presentRule,

    // Type checks
    stringRule,
    integerRule,
    numericRule,
    booleanRule,
    arrayRule,

    // String
    minRule,
    maxRule,
    betweenRule,
    regexRule,
    notRegexRule,
    alphaRule,
    alphaNumRule,
    alphaDashRule,
    lowercaseRule,
    uppercaseRule,
    startsWithRule,
    endsWithRule,
    containsRule,

    // Numeric
    gtRule,
    gteRule,
    ltRule,
    lteRule,

    // Array
    distinctRule,

    // Format
    emailRule,
    urlRule,
    ipRule,
    uuidRule,
    jsonRule,
    dateRule,
    dateFormatRule,
    afterRule,
    beforeRule,

    // Comparison
    inRule,
    notInRule,
    sameRule,
    differentRule,
    confirmedRule,

    // Regional
    oibRule,
    phoneRule,
    ibanRule,
    vatEuRule,
};
