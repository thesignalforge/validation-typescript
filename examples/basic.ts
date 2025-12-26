/**
 * Basic usage example for @signalforge/validation
 */
import { Validator, MessageFormatter, defaultMessages, type Rules } from '../src';

// Define validation rules
const rules: Rules = {
    email: ['required', 'email'],
    name: ['required', 'string', ['min', 2], ['max', 100]],
    age: ['nullable', 'integer', ['between', 18, 120]],
    tags: ['required', 'array', ['min', 1], ['max', 10]],
    'tags.*': ['required', 'string', ['max', 50]],
};

// Create validator instance
const validator = new Validator(rules);

// Validate data
const data = {
    email: 'user@example.com',
    name: 'J', // Too short!
    age: 25,
    tags: ['javascript', 'typescript'],
};

const result = validator.validate(data);

if (!result.valid) {
    console.log('Validation failed:');
    console.log(result.errors);
    // {
    //   name: [{ key: 'validation.min.string', params: { field: 'name', min: 2, actual: 1 } }]
    // }
}

// With message formatting
const messages = {
    en: defaultMessages,
    hr: {
        'validation.required': 'Polje {field} je obavezno.',
        'validation.min.string': 'Polje {field} mora imati najmanje {min} znakova.',
    },
};

const formatter = new MessageFormatter(messages, 'en', {
    labels: {
        name: 'Full Name',
    },
});

const formattedErrors = formatter.format(result);
console.log('Formatted errors:');
console.log(formattedErrors);
// {
//   name: ['The Full Name must be at least 2 characters.']
// }

// Static factory usage
const quickResult = Validator.make(
    { email: 'invalid' },
    { email: ['required', 'email'] }
);
console.log('Quick validation:', quickResult.valid); // false

// Type-safe validated data
interface UserForm {
    email: string;
    name: string;
    age: number | null;
    tags: string[];
}

const typedValidator = new Validator<UserForm>({
    email: ['required', 'email'],
    name: ['required', 'string'],
    age: ['nullable', 'integer'],
    tags: ['required', 'array'],
});

const typedResult = typedValidator.validate({
    email: 'user@example.com',
    name: 'John Doe',
    age: 30,
    tags: ['dev'],
});

if (typedResult.valid) {
    // TypeScript knows the shape of validated data
    const { email, name, age, tags } = typedResult.validated;
    console.log(`User: ${name} (${email}), age: ${age}, tags: ${tags.join(', ')}`);
}

// Conditional validation
const conditionalRules: Rules = {
    type: ['required', ['in', ['business', 'personal']]],
    company_name: [
        ['when', ['type', '=', 'business'], [
            'required',
            'string',
            ['max', 200],
        ]],
    ],
    vat_number: [
        ['when', ['and', ['type', '=', 'business'], ['country', 'in', ['HR', 'SI', 'AT']]], [
            'required',
            'vat_eu',
        ]],
    ],
    country: ['required', 'string'],
};

const condValidator = new Validator(conditionalRules);

// Personal type - company_name not required
console.log(condValidator.validate({
    type: 'personal',
    country: 'HR',
}).valid); // true

// Business type - company_name required
console.log(condValidator.validate({
    type: 'business',
    country: 'HR',
}).valid); // false - missing company_name and vat_number
