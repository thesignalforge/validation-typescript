export class ValidationException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationException';
    }
}

export class InvalidRuleException extends Error {
    constructor(
        public readonly ruleName: string,
        message: string
    ) {
        super(`Invalid rule "${ruleName}": ${message}`);
        this.name = 'InvalidRuleException';
    }
}

export class UnknownRuleException extends Error {
    constructor(public readonly ruleName: string) {
        super(`Unknown rule: "${ruleName}"`);
        this.name = 'UnknownRuleException';
    }
}

export class InvalidRuleNameException extends Error {
    constructor(
        public readonly ruleName: string,
        reason: string
    ) {
        super(`Invalid rule name "${ruleName}": ${reason}`);
        this.name = 'InvalidRuleNameException';
    }
}
