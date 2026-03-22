/**
 * @fileoverview ErrorHandler - Centralized error handling and validation
 * @description Provides comprehensive error handling, input validation,
 * and user-friendly error messages for the calculator application.
 * 
 * @module ErrorHandler
 * @version 1.0.0
 * 
 * @example
 * import { ErrorHandler } from './ErrorHandler.js';
 * 
 * const handler = new ErrorHandler();
 * 
 * // Get error details
 * const error = handler.getErrorDetails('DIVISION_BY_ZERO');
 * console.log(error.message); // "Невозможно разделить на ноль"
 * 
 * // Validate expression
 * const validation = handler.validateExpression('(2 + 3');
 * if (!validation.valid) {
 *   console.log(validation.errors); // [{ code: 'UNBALANCED_PARENTHESES', ... }]
 * }
 * 
 * // Validate result
 * const result = handler.validateResult(Infinity);
 * if (result.warning) {
 *   console.log('Warning:', result.warning); // 'INFINITY_RESULT'
 * }
 */

/**
 * Error severity levels
 * @typedef {'error'|'warning'|'info'} ErrorSeverity
 */

/**
 * Error details object
 * @typedef {Object} ErrorDetails
 * @property {string} title - Short error title
 * @property {string} message - Detailed error message
 * @property {string} icon - Icon/emoji for the error
 * @property {ErrorSeverity} severity - Error severity level
 */

/**
 * Validation result
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether validation passed
 * @property {string} [error] - Error code (if invalid)
 * @property {boolean} [block] - Whether to block the input
 */

/**
 * Expression validation result
 * @typedef {Object} ExpressionValidationResult
 * @property {boolean} valid - Whether expression is valid
 * @property {Array<{code: string, position: number}>} errors - List of errors found
 */

/**
 * Result validation result
 * @typedef {Object} ResultValidationResult
 * @property {boolean} valid - Whether result is displayable
 * @property {string} [error] - Error code (if invalid)
 * @property {string} [warning] - Warning code (if needs attention)
 * @property {string|number} [value] - Formatted value (if needs conversion)
 */

/**
 * Centralized error handler for calculator operations
 * @class ErrorHandler
 */
class ErrorHandler {
    /**
     * Create a new ErrorHandler instance
     * @constructor
     */
    constructor() {
        /** @type {Object<string, ErrorDetails>} Map of error codes to details */
        this.errorMessages = this.createErrorMessages();
        
        /** @type {Object<string, Object>} Validation rules for different input types */
        this.validationRules = this.createValidationRules();
    }
    
    /**
     * Create map of error codes to user-friendly messages
     */
    createErrorMessages() {
        return {
            // Division errors
            'DIVISION_BY_ZERO': {
                title: 'Деление на ноль',
                message: 'Невозможно разделить на ноль',
                icon: '÷',
                severity: 'error'
            },
            'MODULO_BY_ZERO': {
                title: 'Остаток от деления на ноль',
                message: 'Невозможно вычислить остаток от деления на ноль',
                icon: '%',
                severity: 'error'
            },
            
            // Domain errors
            'SQRT_NEGATIVE': {
                title: 'Корень отрицательного числа',
                message: 'Квадратный корень определён только для неотрицательных чисел',
                icon: '√',
                severity: 'error'
            },
            'LOG_NON_POSITIVE': {
                title: 'Логарифм недопустимого числа',
                message: 'Логарифм определён только для положительных чисел',
                icon: 'log',
                severity: 'error'
            },
            'ASIN_OUT_OF_RANGE': {
                title: 'Аргумент вне диапазона',
                message: 'Арксинус определён только для значений от -1 до 1',
                icon: 'asin',
                severity: 'error'
            },
            'ACOS_OUT_OF_RANGE': {
                title: 'Аргумент вне диапазона',
                message: 'Арккосинус определён только для значений от -1 до 1',
                icon: 'acos',
                severity: 'error'
            },
            'TAN_UNDEFINED': {
                title: 'Тангенс не определён',
                message: 'Тангенс не определён для данного угла (cos = 0)',
                icon: 'tan',
                severity: 'error'
            },
            'FACTORIAL_INVALID': {
                title: 'Недопустимый факториал',
                message: 'Факториал определён только для целых неотрицательных чисел',
                icon: 'n!',
                severity: 'error'
            },
            'FACTORIAL_OVERFLOW': {
                title: 'Переполнение',
                message: 'Факториал слишком большого числа (максимум 170)',
                icon: 'n!',
                severity: 'error'
            },
            
            // Overflow errors
            'OVERFLOW': {
                title: 'Переполнение',
                message: 'Результат слишком большой для отображения',
                icon: '∞',
                severity: 'error'
            },
            'UNDERFLOW': {
                title: 'Слишком малое число',
                message: 'Результат слишком мал для отображения',
                icon: '0',
                severity: 'warning'
            },
            
            // Syntax errors
            'UNBALANCED_PARENTHESES': {
                title: 'Несбалансированные скобки',
                message: 'Проверьте количество открывающих и закрывающих скобок',
                icon: '( )',
                severity: 'error'
            },
            'MISSING_OPERAND': {
                title: 'Отсутствует операнд',
                message: 'Введите число перед или после оператора',
                icon: '?',
                severity: 'error'
            },
            'MISSING_OPERATOR': {
                title: 'Отсутствует оператор',
                message: 'Между числами должен быть оператор',
                icon: '+',
                severity: 'error'
            },
            'INVALID_EXPRESSION': {
                title: 'Некорректное выражение',
                message: 'Проверьте правильность введённого выражения',
                icon: '!',
                severity: 'error'
            },
            'EMPTY_EXPRESSION': {
                title: 'Пустое выражение',
                message: 'Введите математическое выражение',
                icon: '∅',
                severity: 'warning'
            },
            'UNKNOWN_FUNCTION': {
                title: 'Неизвестная функция',
                message: 'Функция не поддерживается',
                icon: 'f(x)',
                severity: 'error'
            },
            'UNKNOWN_SYMBOL': {
                title: 'Неизвестный символ',
                message: 'Обнаружен недопустимый символ',
                icon: '?',
                severity: 'error'
            },
            'TOO_MANY_DECIMALS': {
                title: 'Несколько десятичных точек',
                message: 'В числе может быть только одна десятичная точка',
                icon: '.',
                severity: 'error'
            },
            'CONSECUTIVE_OPERATORS': {
                title: 'Несколько операторов подряд',
                message: 'Между операторами должно быть число',
                icon: '++',
                severity: 'error'
            },
            
            // Input errors
            'MAX_DIGITS_REACHED': {
                title: 'Достигнут лимит цифр',
                message: 'Максимум 15 цифр в числе',
                icon: '15',
                severity: 'warning'
            },
            'INVALID_INPUT': {
                title: 'Недопустимый ввод',
                message: 'Данный ввод не разрешён в текущем контексте',
                icon: '⊘',
                severity: 'warning'
            },
            
            // Result errors
            'NAN_RESULT': {
                title: 'Результат не определён',
                message: 'Вычисление привело к неопределённому результату',
                icon: 'NaN',
                severity: 'error'
            },
            'INFINITY_RESULT': {
                title: 'Бесконечность',
                message: 'Результат стремится к бесконечности',
                icon: '∞',
                severity: 'warning'
            }
        };
    }
    
    /**
     * Create validation rules for input
     */
    createValidationRules() {
        return {
            digit: {
                validate: (context) => {
                    const currentLength = context.currentValue.replace(/[^0-9]/g, '').length;
                    if (currentLength >= 15 && !context.waitingForOperand) {
                        return { valid: false, error: 'MAX_DIGITS_REACHED' };
                    }
                    return { valid: true };
                }
            },
            decimal: {
                validate: (context) => {
                    if (context.currentValue.includes('.') && !context.waitingForOperand) {
                        return { valid: false, error: 'TOO_MANY_DECIMALS', block: true };
                    }
                    return { valid: true };
                }
            },
            operator: {
                validate: (context) => {
                    if (context.expressionMode) {
                        const lastChar = context.expressionString.slice(-1);
                        if (context.expressionString.length === 0) {
                            return { valid: false, error: 'MISSING_OPERAND', block: true };
                        }
                    }
                    return { valid: true };
                }
            },
            parenthesisClose: {
                validate: (context) => {
                    if (context.openParentheses <= 0) {
                        return { valid: false, error: 'UNBALANCED_PARENTHESES', block: true };
                    }
                    return { valid: true };
                }
            }
        };
    }
    
    /**
     * Get user-friendly error message
     * @param {string} errorCode - Error code or raw error message
     * @returns {Object} Error details
     */
    getErrorDetails(errorCode) {
        if (this.errorMessages[errorCode]) {
            return this.errorMessages[errorCode];
        }
        
        const mapped = this.mapRawErrorToCode(errorCode);
        if (mapped && this.errorMessages[mapped]) {
            return this.errorMessages[mapped];
        }
        
        return {
            title: 'Ошибка',
            message: errorCode || 'Произошла неизвестная ошибка',
            icon: '!',
            severity: 'error'
        };
    }
    
    /**
     * Map raw error message to error code
     */
    mapRawErrorToCode(rawError) {
        if (!rawError) return null;
        
        const errorText = String(rawError).toLowerCase();
        
        if (errorText.includes('деление на ноль') || errorText.includes('division by zero')) {
            return 'DIVISION_BY_ZERO';
        }
        if (errorText.includes('корень') && errorText.includes('отрицат')) {
            return 'SQRT_NEGATIVE';
        }
        if (errorText.includes('логарифм') || errorText.includes('log')) {
            return 'LOG_NON_POSITIVE';
        }
        if (errorText.includes('asin') || (errorText.includes('арксинус') && errorText.includes('диапазон'))) {
            return 'ASIN_OUT_OF_RANGE';
        }
        if (errorText.includes('acos') || (errorText.includes('арккосинус') && errorText.includes('диапазон'))) {
            return 'ACOS_OUT_OF_RANGE';
        }
        if (errorText.includes('тангенс') && errorText.includes('не определён')) {
            return 'TAN_UNDEFINED';
        }
        if (errorText.includes('факториал')) {
            if (errorText.includes('переполнение') || errorText.includes('overflow')) {
                return 'FACTORIAL_OVERFLOW';
            }
            return 'FACTORIAL_INVALID';
        }
        if (errorText.includes('скобки') || errorText.includes('parenthes')) {
            return 'UNBALANCED_PARENTHESES';
        }
        if (errorText.includes('операнд')) {
            return 'MISSING_OPERAND';
        }
        if (errorText.includes('переполнение') || errorText.includes('overflow')) {
            return 'OVERFLOW';
        }
        if (errorText.includes('неизвестн') && errorText.includes('функц')) {
            return 'UNKNOWN_FUNCTION';
        }
        if (errorText.includes('неизвестн') && errorText.includes('символ')) {
            return 'UNKNOWN_SYMBOL';
        }
        if (errorText.includes('пуст')) {
            return 'EMPTY_EXPRESSION';
        }
        
        return null;
    }
    
    /**
     * Validate input before processing
     * @param {string} inputType - Type of input (digit, decimal, operator, etc.)
     * @param {Object} context - Current calculator state
     * @returns {Object} Validation result
     */
    validateInput(inputType, context) {
        const rule = this.validationRules[inputType];
        if (!rule) {
            return { valid: true };
        }
        
        return rule.validate(context);
    }
    
    /**
     * Validate expression syntax
     * @param {string} expression - Expression to validate
     * @returns {Object} Validation result with detailed errors
     */
    validateExpression(expression) {
        const errors = [];
        
        if (!expression || expression.trim() === '') {
            return { valid: false, errors: [{ code: 'EMPTY_EXPRESSION', position: 0 }] };
        }
        
        let parenCount = 0;
        let lastWasOperator = true;
        let lastWasNumber = false;
        let decimalInCurrentNumber = false;
        
        const normalized = expression.replace(/\s+/g, '');
        
        for (let i = 0; i < normalized.length; i++) {
            const char = normalized[i];
            const nextChar = normalized[i + 1];
            
            if (/[0-9]/.test(char)) {
                lastWasOperator = false;
                lastWasNumber = true;
            } else if (char === '.') {
                if (decimalInCurrentNumber) {
                    errors.push({ code: 'TOO_MANY_DECIMALS', position: i });
                }
                decimalInCurrentNumber = true;
                lastWasOperator = false;
            } else if (/[+\-*/×÷^%]/.test(char)) {
                if (lastWasOperator && !/[+\-]/.test(char)) {
                    errors.push({ code: 'CONSECUTIVE_OPERATORS', position: i });
                }
                lastWasOperator = true;
                lastWasNumber = false;
                decimalInCurrentNumber = false;
            } else if (char === '(') {
                parenCount++;
                lastWasOperator = true;
                lastWasNumber = false;
                decimalInCurrentNumber = false;
            } else if (char === ')') {
                parenCount--;
                if (parenCount < 0) {
                    errors.push({ code: 'UNBALANCED_PARENTHESES', position: i });
                }
                lastWasOperator = false;
                lastWasNumber = true;
                decimalInCurrentNumber = false;
            } else if (/[a-zA-Z]/.test(char)) {
                lastWasOperator = false;
                lastWasNumber = false;
                decimalInCurrentNumber = false;
            }
        }
        
        if (parenCount !== 0) {
            errors.push({ code: 'UNBALANCED_PARENTHESES', position: expression.length });
        }
        
        const lastChar = normalized.slice(-1);
        if (/[+\-*/×÷^%]/.test(lastChar)) {
            errors.push({ code: 'MISSING_OPERAND', position: expression.length });
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
    
    /**
     * Check if a number result is valid
     * @param {number} result - Calculation result
     * @returns {Object} Validation result
     */
    validateResult(result) {
        if (typeof result !== 'number') {
            return { valid: false, error: 'INVALID_EXPRESSION' };
        }
        
        if (isNaN(result)) {
            return { valid: false, error: 'NAN_RESULT' };
        }
        
        if (!isFinite(result)) {
            return { 
                valid: true, 
                warning: 'INFINITY_RESULT',
                value: result > 0 ? '∞' : '-∞'
            };
        }
        
        if (Math.abs(result) > 1e308) {
            return { valid: false, error: 'OVERFLOW' };
        }
        
        if (Math.abs(result) < 1e-308 && result !== 0) {
            return { 
                valid: true, 
                warning: 'UNDERFLOW',
                value: 0
            };
        }
        
        return { valid: true };
    }
    
    /**
     * Format error for display
     * @param {string} errorCode - Error code
     * @returns {string} Formatted error message
     */
    formatError(errorCode) {
        const details = this.getErrorDetails(errorCode);
        return details.message;
    }
    
    /**
     * Get error severity level
     * @param {string} errorCode - Error code
     * @returns {string} Severity: 'error', 'warning', 'info'
     */
    getSeverity(errorCode) {
        const details = this.getErrorDetails(errorCode);
        return details.severity || 'error';
    }
    
    /**
     * Check if input should be blocked
     * @param {string} inputType - Type of input
     * @param {Object} context - Current state
     * @returns {boolean} Whether input should be blocked
     */
    shouldBlockInput(inputType, context) {
        const validation = this.validateInput(inputType, context);
        return !validation.valid && validation.block === true;
    }
    
    /**
     * Get all supported error codes
     * @returns {Array} List of error codes
     */
    getErrorCodes() {
        return Object.keys(this.errorMessages);
    }
}

export { ErrorHandler };
