import type {
    Rule,
    FieldRules,
    Rules,
    ParsedRule,
    ParsedConditionalRule,
    ParsedRuleItem,
    Condition,
    RuleParams,
} from './types';
import { getRule } from './rules';
import { UnknownRuleException, InvalidRuleNameException } from './errors';

const MAX_LENGTH = 1024;
const NAME_PATTERN = /^[a-z][a-z0-9_]*$/;

/**
 * Parse a single rule into its components.
 */
export function parseRule(rule: Rule): ParsedRuleItem {
    // Conditional rule: ['when', condition, thenRules, elseRules?]
    if (Array.isArray(rule) && rule[0] === 'when') {
        const [, condition, thenRules, elseRules] = rule as [
            'when',
            Condition,
            Rule[],
            Rule[]?
        ];

        return {
            type: 'conditional',
            condition,
            thenRules: thenRules.map(r => parseSimpleRule(r)),
            elseRules: elseRules?.map(r => parseSimpleRule(r)),
        } as ParsedConditionalRule;
    }

    return parseSimpleRule(rule);
}

/**
 * Parse a simple (non-conditional) rule.
 */
function parseSimpleRule(rule: Rule): ParsedRule {
    let name: string;
    let params: RuleParams = [];

    if (typeof rule === 'string') {
        // Simple rule: 'required'
        name = rule;
    } else if (Array.isArray(rule)) {
        // Parameterized rule: ['min', 2]
        [name, ...params] = rule as [string, ...RuleParams];
    } else {
        throw new InvalidRuleNameException(String(rule), 'Invalid rule format');
    }

    // Validate rule name
    validateRuleName(name);

    // Get rule handler
    const handler = getRule(name);
    if (!handler) {
        throw new UnknownRuleException(name);
    }

    return { name, params, handler };
}

/**
 * Validate a rule name.
 */
function validateRuleName(name: string): void {
    if (name.length > MAX_LENGTH) {
        throw new InvalidRuleNameException(
            name,
            `Rule name exceeds maximum length of ${MAX_LENGTH}`
        );
    }

    if (!NAME_PATTERN.test(name)) {
        throw new InvalidRuleNameException(
            name,
            'Rule name must start with a lowercase letter and contain only lowercase letters, numbers, and underscores'
        );
    }
}

/**
 * Parse all rules for a field.
 */
export function parseFieldRules(rules: FieldRules): ParsedRuleItem[] {
    return rules.map(parseRule);
}

/**
 * Parse all rules.
 */
export function parseRules(rules: Rules): Map<string, ParsedRuleItem[]> {
    const parsed = new Map<string, ParsedRuleItem[]>();

    for (const [field, fieldRules] of Object.entries(rules)) {
        parsed.set(field, parseFieldRules(fieldRules));
    }

    return parsed;
}

/**
 * Check if a field has the 'nullable' rule.
 */
export function hasNullableRule(parsedRules: ParsedRuleItem[]): boolean {
    return parsedRules.some(
        item => 'name' in item && item.name === 'nullable'
    );
}

/**
 * Check if a parsed rule item is a conditional rule.
 */
export function isConditionalRule(
    item: ParsedRuleItem
): item is ParsedConditionalRule {
    return 'type' in item && item.type === 'conditional';
}
