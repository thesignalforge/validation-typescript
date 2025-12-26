// Main exports
export { Validator } from './validator';
export { MessageFormatter, defaultMessages } from './formatter';

// Types
export type {
    Rule,
    Rules,
    FieldRules,
    SimpleRule,
    ParameterizedRule,
    ConditionalRule,
    RuleName,
    RuleParams,
    RuleHandler,
    ValidationResult,
    ValidationError,
    Condition,
    SelfCondition,
    FieldCondition,
    CompoundCondition,
    ComparisonOp,
} from './types';

export type { FormatterOptions } from './formatter';

// Rule registry
export { getRule, hasRule, registerRule, getRuleNames } from './rules';

// Individual rules for tree-shaking
export {
    requiredRule,
    nullableRule,
    filledRule,
    presentRule,
    stringRule,
    integerRule,
    numericRule,
    booleanRule,
    arrayRule,
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
    gtRule,
    gteRule,
    ltRule,
    lteRule,
    distinctRule,
    emailRule,
    urlRule,
    ipRule,
    uuidRule,
    jsonRule,
    dateRule,
    dateFormatRule,
    afterRule,
    beforeRule,
    inRule,
    notInRule,
    sameRule,
    differentRule,
    confirmedRule,
    oibRule,
    phoneRule,
    ibanRule,
    vatEuRule,
} from './rules';

// Errors
export {
    ValidationException,
    InvalidRuleException,
    UnknownRuleException,
    InvalidRuleNameException,
} from './errors';

// Utilities
export { isEmpty, isFilled } from './utils/is-empty';
export { get, set } from './utils/get';
export { expandWildcards, isWildcardPattern } from './wildcard';
export { evaluateCondition } from './condition';
