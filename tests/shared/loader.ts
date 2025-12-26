import requiredCases from './required.json';
import emailCases from './email.json';

export interface TestCase {
    input: unknown;
    valid: boolean;
    error?: { key: string };
    note?: string;
}

export interface SharedTestSuite {
    rule: string;
    cases: TestCase[];
}

export const sharedTestCases: Record<string, SharedTestSuite> = {
    required: requiredCases as SharedTestSuite,
    email: emailCases as SharedTestSuite,
};
