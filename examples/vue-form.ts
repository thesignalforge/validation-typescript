/**
 * Vue 3 composable for form validation
 *
 * This example demonstrates how to use @signalforge/validation
 * with Vue 3's Composition API for form validation.
 */
import { ref, reactive, computed } from 'vue';
import {
    Validator,
    MessageFormatter,
    defaultMessages,
    type Rules,
    type ValidationResult,
} from '../src';

// ============================================================================
// useValidation Composable
// ============================================================================

export function useValidation<T extends Record<string, unknown>>(
    rules: Rules,
    messages: Record<string, Record<string, string>>,
    locale: string = 'en',
    labels?: Record<string, string>
) {
    const errors = reactive<Record<string, string[]>>({});
    const isValid = ref(true);
    const isDirty = ref(false);

    const validator = new Validator<T>(rules);
    const formatter = new MessageFormatter(messages, locale, { labels });

    function validate(data: Record<string, unknown>): ValidationResult<T> {
        isDirty.value = true;
        const result = validator.validate(data);

        isValid.value = result.valid;

        // Clear existing errors
        Object.keys(errors).forEach(k => delete errors[k]);

        // Add new errors
        if (!result.valid) {
            Object.assign(errors, formatter.format(result));
        }

        return result;
    }

    function validateField(
        field: string,
        value: unknown,
        allData: Record<string, unknown>
    ): boolean {
        isDirty.value = true;
        const data = { ...allData, [field]: value };
        const result = validator.validate(data);

        if (result.errors[field]) {
            errors[field] = formatter.format({
                valid: false,
                errors: { [field]: result.errors[field] },
                validated: {},
            })[field];
            return false;
        } else {
            delete errors[field];
            return true;
        }
    }

    function clearErrors(): void {
        Object.keys(errors).forEach(k => delete errors[k]);
        isValid.value = true;
        isDirty.value = false;
    }

    function clearFieldError(field: string): void {
        delete errors[field];
    }

    const hasErrors = computed(() => Object.keys(errors).length > 0);

    return {
        validate,
        validateField,
        errors,
        isValid,
        isDirty,
        hasErrors,
        clearErrors,
        clearFieldError,
    };
}

// ============================================================================
// Example Usage in a Vue Component
// ============================================================================

/*
<script setup lang="ts">
import { reactive } from 'vue';
import { useValidation } from './vue-form';
import { defaultMessages, type Rules } from '@signalforge/validation';

// Validation rules
const rules: Rules = {
    email: ['required', 'email'],
    name: ['required', 'string', ['min', 2], ['max', 100]],
    password: ['required', 'string', ['min', 8]],
    password_confirmation: ['required', 'same', 'password'],
};

// Messages
const messages = {
    en: defaultMessages,
};

// Labels
const labels = {
    email: 'Email Address',
    name: 'Full Name',
    password: 'Password',
    password_confirmation: 'Password Confirmation',
};

// Form data
const form = reactive({
    email: '',
    name: '',
    password: '',
    password_confirmation: '',
});

// Validation
const { validate, validateField, errors, clearFieldError } = useValidation(
    rules,
    messages,
    'en',
    labels
);

// Handlers
function handleBlur(field: keyof typeof form) {
    validateField(field, form[field], form);
}

function handleInput(field: keyof typeof form) {
    clearFieldError(field);
}

function handleSubmit() {
    const result = validate(form);

    if (result.valid) {
        console.log('Form submitted:', result.validated);
        // Submit to API
    }
}
</script>

<template>
    <form @submit.prevent="handleSubmit">
        <div class="form-group">
            <label for="email">Email Address</label>
            <input
                id="email"
                v-model="form.email"
                type="email"
                :class="{ error: errors.email }"
                @blur="handleBlur('email')"
                @input="handleInput('email')"
            />
            <span v-if="errors.email" class="error-message">
                {{ errors.email[0] }}
            </span>
        </div>

        <div class="form-group">
            <label for="name">Full Name</label>
            <input
                id="name"
                v-model="form.name"
                type="text"
                :class="{ error: errors.name }"
                @blur="handleBlur('name')"
                @input="handleInput('name')"
            />
            <span v-if="errors.name" class="error-message">
                {{ errors.name[0] }}
            </span>
        </div>

        <div class="form-group">
            <label for="password">Password</label>
            <input
                id="password"
                v-model="form.password"
                type="password"
                :class="{ error: errors.password }"
                @blur="handleBlur('password')"
                @input="handleInput('password')"
            />
            <span v-if="errors.password" class="error-message">
                {{ errors.password[0] }}
            </span>
        </div>

        <div class="form-group">
            <label for="password_confirmation">Confirm Password</label>
            <input
                id="password_confirmation"
                v-model="form.password_confirmation"
                type="password"
                :class="{ error: errors.password_confirmation }"
                @blur="handleBlur('password_confirmation')"
                @input="handleInput('password_confirmation')"
            />
            <span v-if="errors.password_confirmation" class="error-message">
                {{ errors.password_confirmation[0] }}
            </span>
        </div>

        <button type="submit">Register</button>
    </form>
</template>

<style scoped>
.form-group {
    margin-bottom: 1rem;
}

.error {
    border-color: red;
}

.error-message {
    color: red;
    font-size: 0.875rem;
}
</style>
*/

export default useValidation;
