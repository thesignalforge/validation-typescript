// Rule name constraints
export const RULE_NAME_MAX_LENGTH = 1024;
export const RULE_NAME_PATTERN = /^[a-z][a-z0-9_]*$/;

// Basic rule types
export type RuleName = string;
export type RuleParams = (string | number | boolean | RegExp | unknown[])[];

export type SimpleRule = RuleName;
export type ParameterizedRule = [RuleName, ...RuleParams];
export type ConditionalRule = ['when', Condition, Rule[], Rule[]?];

export type Rule = SimpleRule | ParameterizedRule | ConditionalRule;
export type FieldRules = Rule[];

export type Rules = Record<string, FieldRules>;

// Comparison operators
export type ComparisonOp = '=' | '!=' | '>' | '>=' | '<' | '<=';

// Self-referential conditions
export type SelfCondition =
    | ['@length', ComparisonOp, number]
    | ['@value', '=' | '!=', unknown]
    | ['@matches', RegExp | string]
    | ['@type', 'string' | 'number' | 'boolean' | 'array' | 'object']
    | ['@empty']
    | ['@filled'];

// Cross-field conditions
export type FieldCondition =
    | [string, '=' | '!=' | '>' | '>=' | '<' | '<=', unknown]
    | [string, 'in' | 'not_in', unknown[]]
    | [string, 'filled' | 'empty'];

// Compound conditions
export type CompoundCondition =
    | ['and', ...Condition[]]
    | ['or', ...Condition[]];

export type Condition = SelfCondition | FieldCondition | CompoundCondition;

// Validation error
export interface ValidationError {
    key: string;
    params: Record<string, string | number>;
}

// Validation result
export interface ValidationResult<T = Record<string, unknown>> {
    valid: boolean;
    errors: Record<string, ValidationError[]>;
    validated: T;
}

// Rule handler interface
export interface RuleHandler {
    name: string;

    validate(
        value: unknown,
        params: RuleParams,
        data: Record<string, unknown>,
        field: string
    ): ValidationError | null;

    // If true, stop validation chain on failure (default: false)
    bailOnFailure?: boolean;

    // If true, skip rule when value is empty (default: true)
    // Only 'required' should have this false
    skipIfEmpty?: boolean;
}

// Parsed rule representation
export interface ParsedRule {
    name: string;
    params: RuleParams;
    handler: RuleHandler;
}

// Conditional parsed rule
export interface ParsedConditionalRule {
    type: 'conditional';
    condition: Condition;
    thenRules: ParsedRule[];
    elseRules?: ParsedRule[];
}

export type ParsedRuleItem = ParsedRule | ParsedConditionalRule;
