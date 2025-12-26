import type {
    Rules,
    ValidationResult,
    ValidationError,
    ParsedRuleItem,
    ParsedRule,
    ParsedConditionalRule,
} from './types';
import { parseRules, hasNullableRule, isConditionalRule } from './parser';
import { evaluateCondition } from './condition';
import { expandWildcards, isWildcardPattern } from './wildcard';
import { get, set } from './utils/get';
import { isEmpty } from './utils/is-empty';

/**
 * Main Validator class.
 */
export class Validator<T = Record<string, unknown>> {
    private parsedRules: Map<string, ParsedRuleItem[]>;

    constructor(private rules: Rules) {
        this.parsedRules = parseRules(rules);
    }

    /**
     * Static factory method.
     */
    static make<T = Record<string, unknown>>(
        data: Record<string, unknown>,
        rules: Rules
    ): ValidationResult<T> {
        return new Validator<T>(rules).validate(data);
    }

    /**
     * Validate data synchronously.
     */
    validate(data: Record<string, unknown>): ValidationResult<T> {
        const errors: Record<string, ValidationError[]> = {};
        const validated: Record<string, unknown> = {};

        for (const [fieldPattern, fieldRules] of this.parsedRules) {
            // Handle wildcard patterns
            if (isWildcardPattern(fieldPattern)) {
                const expanded = expandWildcards(fieldPattern, data);

                for (const [expandedField, value] of expanded) {
                    const fieldErrors = this.validateField(
                        expandedField,
                        value,
                        data,
                        fieldRules
                    );

                    if (fieldErrors.length > 0) {
                        errors[expandedField] = fieldErrors;
                    } else {
                        set(validated, expandedField, value);
                    }
                }
            } else {
                const value = get(data, fieldPattern);
                const fieldErrors = this.validateField(
                    fieldPattern,
                    value,
                    data,
                    fieldRules
                );

                if (fieldErrors.length > 0) {
                    errors[fieldPattern] = fieldErrors;
                } else {
                    set(validated, fieldPattern, value);
                }
            }
        }

        const valid = Object.keys(errors).length === 0;

        return {
            valid,
            errors,
            validated: (valid ? validated : {}) as T,
        };
    }

    /**
     * Validate data asynchronously (for rules that need async).
     */
    async validateAsync(data: Record<string, unknown>): Promise<ValidationResult<T>> {
        // For now, just call sync validate.
        // Async rules can be added later.
        return this.validate(data);
    }

    /**
     * Validate a single field.
     */
    private validateField(
        field: string,
        value: unknown,
        allData: Record<string, unknown>,
        rules: ParsedRuleItem[]
    ): ValidationError[] {
        const errors: ValidationError[] = [];
        const isNullable = hasNullableRule(rules);

        // If nullable and value is empty, skip validation
        if (isNullable && isEmpty(value)) {
            return errors;
        }

        for (const ruleItem of rules) {
            if (isConditionalRule(ruleItem)) {
                // Handle conditional rules
                const condErrors = this.validateConditionalRule(
                    field,
                    value,
                    allData,
                    ruleItem
                );
                errors.push(...condErrors);

                // Check if any error came from a bail rule
                if (condErrors.length > 0) {
                    // For now, continue to next rule
                    // Could add bail logic here
                }
            } else {
                // Handle simple rule
                const error = this.validateSimpleRule(
                    field,
                    value,
                    allData,
                    ruleItem
                );

                if (error) {
                    errors.push(error);

                    // Bail on failure if specified
                    if (ruleItem.handler.bailOnFailure) {
                        break;
                    }
                }
            }
        }

        return errors;
    }

    /**
     * Validate a simple rule.
     */
    private validateSimpleRule(
        field: string,
        value: unknown,
        allData: Record<string, unknown>,
        rule: ParsedRule
    ): ValidationError | null {
        const { handler, params } = rule;

        // Skip if empty and rule allows skipping
        const skipIfEmpty = handler.skipIfEmpty !== false;
        if (skipIfEmpty && isEmpty(value)) {
            return null;
        }

        return handler.validate(value, params, allData, field);
    }

    /**
     * Validate a conditional rule.
     */
    private validateConditionalRule(
        field: string,
        value: unknown,
        allData: Record<string, unknown>,
        rule: ParsedConditionalRule
    ): ValidationError[] {
        const errors: ValidationError[] = [];
        const conditionMet = evaluateCondition(
            rule.condition,
            value,
            allData,
            field
        );

        const rulesToApply = conditionMet ? rule.thenRules : rule.elseRules;

        if (rulesToApply) {
            for (const simpleRule of rulesToApply) {
                const error = this.validateSimpleRule(
                    field,
                    value,
                    allData,
                    simpleRule
                );

                if (error) {
                    errors.push(error);

                    // Bail on failure if specified
                    if (simpleRule.handler.bailOnFailure) {
                        break;
                    }
                }
            }
        }

        return errors;
    }

    /**
     * Get the raw rules.
     */
    getRules(): Rules {
        return this.rules;
    }
}
