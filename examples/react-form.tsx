/**
 * React form validation example
 *
 * This example demonstrates how to use @signalforge/validation
 * with React for form validation.
 */
import React, { useState, useCallback, FormEvent } from 'react';
import {
    Validator,
    MessageFormatter,
    defaultMessages,
    type Rules,
    type ValidationResult,
} from '../src';

// ============================================================================
// useValidation Hook
// ============================================================================

export function useValidation<T extends Record<string, unknown>>(
    rules: Rules,
    messages: Record<string, Record<string, string>>,
    locale: string = 'en',
    labels?: Record<string, string>
) {
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [isValid, setIsValid] = useState(true);

    const validator = new Validator<T>(rules);
    const formatter = new MessageFormatter(messages, locale, { labels });

    const validate = useCallback(
        (data: Record<string, unknown>): ValidationResult<T> => {
            const result = validator.validate(data);

            setIsValid(result.valid);
            setErrors(result.valid ? {} : formatter.format(result));

            return result;
        },
        [rules, locale]
    );

    const validateField = useCallback(
        (field: string, value: unknown, allData: Record<string, unknown>) => {
            const data = { ...allData, [field]: value };
            const result = validator.validate(data);

            if (result.errors[field]) {
                setErrors(prev => ({
                    ...prev,
                    [field]: formatter.format({
                        valid: false,
                        errors: { [field]: result.errors[field] },
                        validated: {},
                    })[field],
                }));
            } else {
                setErrors(prev => {
                    const { [field]: _, ...rest } = prev;
                    return rest;
                });
            }

            return !result.errors[field];
        },
        [rules, locale]
    );

    const clearErrors = useCallback(() => {
        setErrors({});
        setIsValid(true);
    }, []);

    const clearFieldError = useCallback((field: string) => {
        setErrors(prev => {
            const { [field]: _, ...rest } = prev;
            return rest;
        });
    }, []);

    return {
        validate,
        validateField,
        errors,
        isValid,
        clearErrors,
        clearFieldError,
    };
}

// ============================================================================
// Example Form Component
// ============================================================================

// Validation messages
const messages = {
    en: {
        ...defaultMessages,
    },
    hr: {
        'validation.required': 'Polje {field} je obavezno.',
        'validation.email': 'Polje {field} mora biti ispravna email adresa.',
        'validation.min.string': 'Polje {field} mora imati najmanje {min} znakova.',
    },
};

// Field labels
const labels = {
    email: 'Email Address',
    name: 'Full Name',
    password: 'Password',
    password_confirmation: 'Password Confirmation',
};

// Validation rules
const registrationRules: Rules = {
    email: ['required', 'email'],
    name: ['required', 'string', ['min', 2], ['max', 100]],
    password: ['required', 'string', ['min', 8]],
    password_confirmation: ['required', 'same', 'password'],
};

interface FormData {
    email: string;
    name: string;
    password: string;
    password_confirmation: string;
}

export function RegistrationForm() {
    const [formData, setFormData] = useState<FormData>({
        email: '',
        name: '',
        password: '',
        password_confirmation: '',
    });

    const { validate, validateField, errors, clearFieldError } = useValidation<FormData>(
        registrationRules,
        messages,
        'en',
        labels
    );

    const handleChange = (field: keyof FormData) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, [field]: value }));
        clearFieldError(field);
    };

    const handleBlur = (field: keyof FormData) => () => {
        validateField(field, formData[field], formData);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const result = validate(formData);

        if (result.valid) {
            console.log('Form submitted:', result.validated);
            // Submit to API
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    onBlur={handleBlur('email')}
                    className={errors.email ? 'error' : ''}
                />
                {errors.email && (
                    <span className="error-message">{errors.email[0]}</span>
                )}
            </div>

            <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange('name')}
                    onBlur={handleBlur('name')}
                    className={errors.name ? 'error' : ''}
                />
                {errors.name && (
                    <span className="error-message">{errors.name[0]}</span>
                )}
            </div>

            <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange('password')}
                    onBlur={handleBlur('password')}
                    className={errors.password ? 'error' : ''}
                />
                {errors.password && (
                    <span className="error-message">{errors.password[0]}</span>
                )}
            </div>

            <div className="form-group">
                <label htmlFor="password_confirmation">Confirm Password</label>
                <input
                    type="password"
                    id="password_confirmation"
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange('password_confirmation')}
                    onBlur={handleBlur('password_confirmation')}
                    className={errors.password_confirmation ? 'error' : ''}
                />
                {errors.password_confirmation && (
                    <span className="error-message">
                        {errors.password_confirmation[0]}
                    </span>
                )}
            </div>

            <button type="submit">Register</button>
        </form>
    );
}

export default RegistrationForm;
