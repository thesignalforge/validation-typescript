# @signalforge/validation

A TypeScript validation library for frontend input validation. Shares the same rule format and semantics as the PHP backend library, enabling consistent validation across frontend and backend.

## Installation

```bash
npm install @signalforge/validation
```

## Quick Start

```typescript
import { Validator, type Rules } from '@signalforge/validation';

const rules: Rules = {
    email: ['required', 'email'],
    name: ['required', 'string', ['min', 2], ['max', 100]],
    age: ['nullable', 'integer', ['between', 18, 120]],
};

const validator = new Validator(rules);

const result = validator.validate({
    email: 'user@example.com',
    name: 'John',
    age: 25,
});

if (result.valid) {
    console.log('Valid data:', result.validated);
} else {
    console.log('Errors:', result.errors);
}
```

## Features

- **Same rule format as PHP** — Copy-paste rules between frontend and backend
- **Type-safe** — Full TypeScript inference for rules and results
- **Conditional validation** — Apply rules based on other field values
- **Wildcard support** — Validate array items with `items.*` syntax
- **Database-friendly** — Rules are plain JSON, store and load from any database
- **i18n ready** — Returns translation keys, not hardcoded messages
- **Zero dependencies** — No runtime dependencies

## Rule Syntax

### Simple Rules

```typescript
const rules: Rules = {
    email: ['required', 'email'],
    name: ['required', 'string'],
};
```

### Parameterized Rules

```typescript
const rules: Rules = {
    name: ['required', 'string', ['min', 2], ['max', 100]],
    age: ['nullable', 'integer', ['between', 18, 120]],
    role: ['required', ['in', ['admin', 'user', 'guest']]],
};
```

### Regex Validation

```typescript
const rules: Rules = {
    slug: ['required', 'string', ['regex', /^[a-z0-9-]+$/]],
    code: ['required', ['not_regex', /[<>]/]],
};
```

### Array Validation

```typescript
const rules: Rules = {
    tags: ['required', 'array', ['min', 1], ['max', 10]],
    'tags.*': ['required', 'string', ['max', 50]],
};
```

### Nested Object Validation

```typescript
const rules: Rules = {
    'user.name': ['required', 'string'],
    'user.email': ['required', 'email'],
    'items.*.name': ['required', 'string'],
    'items.*.quantity': ['required', 'integer', ['min', 1]],
};
```

## Conditional Validation

### Based on Other Fields

```typescript
const rules: Rules = {
    type: ['required', ['in', ['business', 'personal']]],

    // Required only when type is 'business'
    company_name: [
        ['when', ['type', '=', 'business'], [
            'required',
            'string',
            ['max', 200],
        ]],
    ],

    // Different validation based on type
    document_type: [
        'required',
        ['when', ['category', '=', 'legal'],
            [['in', ['contract', 'nda', 'agreement']]],
            [['in', ['report', 'memo', 'note']]],
        ],
    ],
};
```

### Self-Referential Conditions

```typescript
const rules: Rules = {
    bio: [
        'nullable',
        'string',
        // Only validate min length if field is filled
        ['when', ['@filled'], [
            ['min', 10],
        ]],
        // Apply max limit only for long content
        ['when', ['@length', '>=', 256], [
            ['max', 65535],
        ]],
    ],

    code: [
        'required',
        // Different rules based on pattern match
        ['when', ['@matches', /^[A-Z]/], [
            ['min', 5],
        ]],
    ],
};
```

### Compound Conditions

```typescript
const rules: Rules = {
    // AND condition
    vat_number: [
        ['when', ['and', ['type', '=', 'business'], ['country', 'in', ['HR', 'SI', 'AT']]], [
            'required',
            'vat_eu',
        ]],
    ],

    // OR condition
    admin_code: [
        ['when', ['or', ['role', '=', 'admin'], ['role', '=', 'superadmin']], [
            'required',
        ]],
    ],
};
```

### Condition Operators

**Self-referential:**
```typescript
['@empty']                    // Field is empty
['@filled']                   // Field is not empty
['@length', '>=', 256]        // String/array length comparison
['@value', '=', 'special']    // Value comparison
['@matches', /^\d+$/]         // Regex match
['@type', 'string']           // Type check ('string', 'number', 'boolean', 'array', 'object')
```

**Cross-field:**
```typescript
['field', '=', 'value']       // Equals
['field', '!=', 'value']      // Not equals
['field', '>', 100]           // Greater than
['field', '>=', 100]          // Greater than or equal
['field', '<', 100]           // Less than
['field', '<=', 100]          // Less than or equal
['field', 'in', ['a', 'b']]   // In list
['field', 'not_in', ['x']]    // Not in list
['field', 'filled']           // Other field is filled
['field', 'empty']            // Other field is empty
```

## Built-in Rules

### Presence Rules

| Rule | Description |
|------|-------------|
| `required` | Must be present and not empty |
| `nullable` | Can be null/undefined (stops validation chain if null) |
| `filled` | If present, must not be empty |
| `present` | Must exist in input (can be empty) |

### Type Rules

| Rule | Description |
|------|-------------|
| `string` | Must be a string |
| `integer` | Must be an integer (accepts string integers) |
| `numeric` | Must be numeric (accepts string numbers) |
| `boolean` | Must be boolean or boolean-like (0, 1, '0', '1', 'true', 'false') |
| `array` | Must be an array |

### String Rules

| Rule | Description |
|------|-------------|
| `['min', n]` | Minimum length |
| `['max', n]` | Maximum length |
| `['between', min, max]` | Length between |
| `['regex', pattern]` | Must match pattern |
| `['not_regex', pattern]` | Must not match pattern |
| `alpha` | Only letters |
| `alpha_num` | Only letters and numbers |
| `alpha_dash` | Letters, numbers, dashes, underscores |
| `lowercase` | Must be lowercase |
| `uppercase` | Must be uppercase |
| `['starts_with', prefix]` | Starts with prefix |
| `['ends_with', suffix]` | Ends with suffix |
| `['contains', substring]` | Contains substring |

### Numeric Rules

| Rule | Description |
|------|-------------|
| `['min', n]` | Minimum value |
| `['max', n]` | Maximum value |
| `['between', min, max]` | Value between |
| `['gt', field]` | Greater than another field |
| `['gte', field]` | Greater than or equal to another field |
| `['lt', field]` | Less than another field |
| `['lte', field]` | Less than or equal to another field |

### Array Rules

| Rule | Description |
|------|-------------|
| `['min', n]` | Minimum items |
| `['max', n]` | Maximum items |
| `['between', min, max]` | Item count between |
| `distinct` | All items must be unique |

### Format Rules

| Rule | Description |
|------|-------------|
| `email` | Valid email address |
| `url` | Valid URL |
| `['url', ['http', 'https']]` | URL with specific schemes |
| `ip` | Valid IP address (v4 or v6) |
| `['ip', 'v4']` | IPv4 only |
| `['ip', 'v6']` | IPv6 only |
| `uuid` | Valid UUID |
| `['uuid', 4]` | UUID v4 only |
| `json` | Valid JSON string |
| `date` | Valid date |
| `['date_format', format]` | Date matches format |
| `['after', date]` | Date after |
| `['before', date]` | Date before |

### Comparison Rules

| Rule | Description |
|------|-------------|
| `['in', [...values]]` | Value in list |
| `['not_in', [...values]]` | Value not in list |
| `['same', field]` | Matches another field |
| `['different', field]` | Differs from another field |
| `confirmed` | Has matching `{field}_confirmation` |

### Regional Rules

| Rule | Description |
|------|-------------|
| `oib` | Croatian OIB (Personal Identification Number) |
| `['phone', 'HR']` | Phone number (optional country code) |
| `iban` | Valid IBAN |
| `['iban', 'HR']` | IBAN for specific country |
| `vat_eu` | EU VAT number |

## Validation Result

```typescript
interface ValidationResult<T> {
    valid: boolean;
    errors: Record<string, ValidationError[]>;
    validated: T;  // Populated only if valid
}

interface ValidationError {
    key: string;                           // Translation key
    params: Record<string, string | number>; // Interpolation params
}
```

Example error:
```typescript
{
    name: [
        { key: 'validation.min.string', params: { field: 'name', min: 2, actual: 1 } }
    ]
}
```

## Message Formatting

The library returns translation keys, not messages. Use `MessageFormatter` to convert to human-readable messages:

```typescript
import { Validator, MessageFormatter, defaultMessages } from '@signalforge/validation';

const messages = {
    en: defaultMessages,
    hr: {
        'validation.required': 'Polje {field} je obavezno.',
        'validation.min.string': 'Polje {field} mora imati najmanje {min} znakova.',
        'validation.email': 'Polje {field} mora biti ispravna email adresa.',
    },
};

const formatter = new MessageFormatter(messages, 'en');
const result = validator.validate(data);

if (!result.valid) {
    const formatted = formatter.format(result);
    // { name: ['The name must be at least 2 characters.'] }
}
```

### Field Labels

```typescript
const formatter = new MessageFormatter(messages, 'en', {
    labels: {
        email: 'Email Address',
        name: 'Full Name',
        'items.*.name': 'Item Name',  // Wildcard labels
    },
});

// Uses 'Full Name' instead of 'name' in messages
```

### Changing Locale

```typescript
formatter.setLocale('hr');
```

## Type Inference

```typescript
interface UserForm {
    email: string;
    name: string;
    age: number | null;
    tags: string[];
}

const validator = new Validator<UserForm>({
    email: ['required', 'email'],
    name: ['required', 'string', ['min', 2]],
    age: ['nullable', 'integer'],
    tags: ['required', 'array'],
    'tags.*': ['required', 'string'],
});

const result = validator.validate(formData);

if (result.valid) {
    // result.validated is typed as UserForm
    const { email, name, age, tags } = result.validated;
}
```

## Static Factory

```typescript
const result = Validator.make(data, rules);
```

## Dynamic Rules & Database Storage

### Why Dynamic Rules?

In many applications, validation rules aren't static—they need to change based on business requirements, user configurations, or dynamic content types. Consider these scenarios:

- **Custom form builders** where end-users define their own fields and validation requirements
- **Multi-tenant applications** where each tenant has different validation rules for the same entity
- **CMS systems** where content types are defined at runtime, not compile time
- **Configurable workflows** where validation changes based on document state or user role
- **A/B testing** validation rules without deploying new code

Hardcoding validation rules means every change requires a code deployment. By storing rules in a database, you can:

- Let administrators modify validation without developer intervention
- Apply different rules per customer, locale, or environment
- Version and audit rule changes over time
- Roll back problematic rules instantly

### Serializing Rules for Storage

The rule format is pure JSON-compatible data structures (arrays, strings, numbers), making it trivial to serialize for database storage:

```typescript
import { type Rules } from '@signalforge/validation';

// Define rules programmatically or via admin UI
const formRules: Rules = {
    email: ['required', 'email'],
    age: ['nullable', 'integer', ['between', 18, 120]],
    role: ['required', ['in', ['admin', 'user', 'guest']]],
};

// Serialize for database storage
const rulesJson = JSON.stringify(formRules);
// Store rulesJson in your database (TEXT/JSON column)

// Later, retrieve and parse
const storedRules: Rules = JSON.parse(rulesJson);
const validator = new Validator(storedRules);
```

### Database Schema Example

```sql
CREATE TABLE validation_rules (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(100) NOT NULL,  -- e.g., 'contact_form', 'user_profile'
    tenant_id INTEGER,                   -- for multi-tenant apps
    rules JSONB NOT NULL,                -- the serialized rules
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Example: different rules per tenant
INSERT INTO validation_rules (entity_type, tenant_id, rules) VALUES
('contact_form', 1, '{"email": ["required", "email"], "message": ["required", ["min", 10]]}'),
('contact_form', 2, '{"email": ["required", "email"], "phone": ["required", ["phone", "DE"]]}');
```

### Loading Rules at Runtime

```typescript
// Backend: fetch rules from database
async function getValidationRules(entityType: string, tenantId: number): Promise<Rules> {
    const row = await db.query(
        'SELECT rules FROM validation_rules WHERE entity_type = $1 AND tenant_id = $2',
        [entityType, tenantId]
    );
    return row.rules; // Already parsed if using JSONB, or JSON.parse(row.rules)
}

// Frontend: receive rules from API
async function validateForm(formData: Record<string, unknown>) {
    const response = await fetch('/api/validation-rules/contact_form');
    const rules: Rules = await response.json();

    const validator = new Validator(rules);
    return validator.validate(formData);
}
```

### Handling Regex Patterns

The only caveat is regex patterns—they can't be directly JSON serialized. Store them as strings and reconstruct:

```typescript
// When saving to database, convert RegExp to string representation
function serializeRules(rules: Rules): string {
    return JSON.stringify(rules, (key, value) => {
        if (value instanceof RegExp) {
            return { __regex: value.source, __flags: value.flags };
        }
        return value;
    });
}

// When loading from database, restore RegExp objects
function deserializeRules(json: string): Rules {
    return JSON.parse(json, (key, value) => {
        if (value && typeof value === 'object' && '__regex' in value) {
            return new RegExp(value.__regex, value.__flags);
        }
        return value;
    });
}

// Usage
const rules: Rules = {
    slug: ['required', ['regex', /^[a-z0-9-]+$/]],
};

const serialized = serializeRules(rules);
// {"slug":["required",["regex",{"__regex":"^[a-z0-9-]+$","__flags":""}]]}

const restored = deserializeRules(serialized);
// Works exactly like the original
```

### Building an Admin UI

Since rules are plain data structures, you can build admin interfaces that let non-developers configure validation:

```typescript
// Example: building rules from a form builder UI
interface FieldConfig {
    name: string;
    required: boolean;
    type: 'text' | 'email' | 'number' | 'select';
    minLength?: number;
    maxLength?: number;
    options?: string[];  // for select fields
}

function buildRulesFromConfig(fields: FieldConfig[]): Rules {
    const rules: Rules = {};

    for (const field of fields) {
        const fieldRules: Rule[] = [];

        if (field.required) {
            fieldRules.push('required');
        } else {
            fieldRules.push('nullable');
        }

        switch (field.type) {
            case 'email':
                fieldRules.push('email');
                break;
            case 'number':
                fieldRules.push('numeric');
                break;
            case 'select':
                if (field.options) {
                    fieldRules.push(['in', field.options]);
                }
                break;
        }

        if (field.minLength) fieldRules.push(['min', field.minLength]);
        if (field.maxLength) fieldRules.push(['max', field.maxLength]);

        rules[field.name] = fieldRules;
    }

    return rules;
}
```

### Syncing Frontend and Backend

Since this library shares the same rule format as the PHP backend library, you can:

1. Store rules once in the database
2. Serve them to both frontend (TypeScript) and backend (PHP)
3. Get identical validation behavior everywhere

```typescript
// API endpoint returns rules used by both frontend and backend
// GET /api/forms/contact/rules
{
    "email": ["required", "email"],
    "message": ["required", "string", ["min", 10], ["max", 1000]],
    "category": ["required", ["in", ["support", "sales", "other"]]]
}
```

The frontend validates immediately for UX, the backend validates again for security—both using the exact same rules from the same source.

## Custom Rules

```typescript
import { registerRule, type RuleHandler } from '@signalforge/validation';

const myRule: RuleHandler = {
    name: 'my_rule',

    validate(value, params, data, field) {
        if (/* validation fails */) {
            return {
                key: 'validation.my_rule',
                params: { field },
            };
        }
        return null;
    },

    // Optional: stop validation chain on failure
    bailOnFailure: false,

    // Optional: skip when value is empty (default: true)
    skipIfEmpty: true,
};

registerRule(myRule);
```

## Framework Integration

### React Hook

```typescript
import { useState, useCallback } from 'react';
import { Validator, MessageFormatter, type Rules } from '@signalforge/validation';

export function useValidation<T>(rules: Rules, messages: Record<string, Record<string, string>>, locale = 'en') {
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [isValid, setIsValid] = useState(true);

    const validator = new Validator<T>(rules);
    const formatter = new MessageFormatter(messages, locale);

    const validate = useCallback((data: Record<string, unknown>) => {
        const result = validator.validate(data);
        setIsValid(result.valid);
        setErrors(result.valid ? {} : formatter.format(result));
        return result;
    }, [rules, locale]);

    const clearErrors = useCallback(() => {
        setErrors({});
        setIsValid(true);
    }, []);

    return { validate, errors, isValid, clearErrors };
}
```

### Vue Composable

```typescript
import { ref, reactive } from 'vue';
import { Validator, MessageFormatter, type Rules } from '@signalforge/validation';

export function useValidation<T>(rules: Rules, messages: Record<string, Record<string, string>>, locale = 'en') {
    const errors = reactive<Record<string, string[]>>({});
    const isValid = ref(true);

    const validator = new Validator<T>(rules);
    const formatter = new MessageFormatter(messages, locale);

    function validate(data: Record<string, unknown>) {
        const result = validator.validate(data);
        isValid.value = result.valid;

        Object.keys(errors).forEach(k => delete errors[k]);
        if (!result.valid) {
            Object.assign(errors, formatter.format(result));
        }

        return result;
    }

    return { validate, errors, isValid };
}
```

## API Reference

### Validator

```typescript
class Validator<T = Record<string, unknown>> {
    constructor(rules: Rules);

    validate(data: Record<string, unknown>): ValidationResult<T>;
    validateAsync(data: Record<string, unknown>): Promise<ValidationResult<T>>;
    getRules(): Rules;

    static make<T>(data: Record<string, unknown>, rules: Rules): ValidationResult<T>;
}
```

### MessageFormatter

```typescript
class MessageFormatter {
    constructor(
        messages: Record<string, Record<string, string>>,
        locale?: string,
        options?: { labels?: Record<string, string>; defaultLocale?: string }
    );

    format(result: ValidationResult): Record<string, string[]>;
    formatError(error: ValidationError, field: string): string;
    setLocale(locale: string): void;
    getLocale(): string;
    addMessages(locale: string, messages: Record<string, string>): void;
    setLabels(labels: Record<string, string>): void;
}
```

### Rule Registry

```typescript
function getRule(name: string): RuleHandler | undefined;
function hasRule(name: string): boolean;
function registerRule(handler: RuleHandler): void;
function getRuleNames(): string[];
```

### Utilities

```typescript
function isEmpty(value: unknown): boolean;
function isFilled(value: unknown): boolean;
function get(data: Record<string, unknown>, path: string): unknown;
function set(data: Record<string, unknown>, path: string, value: unknown): void;
function expandWildcards(pattern: string, data: Record<string, unknown>): Map<string, unknown>;
function evaluateCondition(condition: Condition, value: unknown, data: Record<string, unknown>, field: string): boolean;
```

## License

MIT
