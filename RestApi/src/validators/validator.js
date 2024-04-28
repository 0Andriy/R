class Validator {
    static isString(value) {
        return typeof value === 'string';
    }

    static isNumber(value) {
        return typeof value === 'number' && !isNaN(value);
    }

    static isInteger(value) {
        return Number.isInteger(value);
    }

    static isFloat(value) {
        return typeof value === 'number' && !Number.isInteger(value);
    }

    static isBoolean(value) {
        return typeof value === 'boolean';
    }

    static isObject(value) {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
    }

    static isArray(value) {
        return Array.isArray(value);
    }

    static isFunction(value) {
        return typeof value === 'function';
    }

    static isDate(value) {
        return value instanceof Date && !isNaN(value);
    }

    static isRegExp(value) {
        return value instanceof RegExp;
    }

    static isNullOrUndefined(value) {
        return value === null || value === undefined;
    }

    static isDefined(value) {
        return value !== undefined && value !== null;
    }

    static isEmptyString(value) {
        return typeof value === 'string' && value.trim() === '';
    }

    static isNotEmptyString(value) {
        return typeof value === 'string' && value.trim() !== '';
    }

    static isEmail(value) {
        const emailRegex = /\S+@\S+\.\S+/;
        return emailRegex.test(value);
    }

    static isURL(value) {
        try {
            new URL(value);
            return true;
        } catch (error) {
            return false;
        }
    }


}


export default Validator;
