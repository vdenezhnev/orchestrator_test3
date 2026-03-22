/**
 * @fileoverview CalculatorModel - Calculator state management and business logic
 * @description Implements the Model component of the MVC pattern.
 * Manages calculator state, performs calculations, handles memory operations,
 * and maintains calculation history.
 * 
 * @module CalculatorModel
 * @version 1.0.0
 * 
 * @example
 * import { CalculatorModel } from './CalculatorModel.js';
 * 
 * const model = new CalculatorModel();
 * 
 * // Simple calculation
 * model.inputDigit('5');
 * model.inputOperator('+');
 * model.inputDigit('3');
 * const result = model.calculate(); // { value: 8, expression: '5 + 3' }
 * 
 * // Expression mode
 * model.setExpressionMode(true);
 * model.inputDigit('2');
 * model.inputParenthesis('(');
 * model.inputDigit('3');
 * model.inputOperator('+');
 * model.inputDigit('4');
 * model.inputParenthesis(')');
 * const result2 = model.calculate(); // { value: 14, expression: '2(3+4)' }
 * 
 * // Memory operations
 * model.memoryStore();     // Store current value
 * model.memoryRecall();    // Recall stored value
 * model.memoryAdd();       // Add to memory
 * model.memorySubtract();  // Subtract from memory
 * model.memoryClear();     // Clear memory
 */

import { ExpressionParser } from './ExpressionParser.js';
import { ErrorHandler } from './ErrorHandler.js';

/**
 * Calculator display state
 * @typedef {Object} DisplayState
 * @property {string} currentValue - Current displayed value
 * @property {string} expression - Current expression string
 * @property {boolean} hasMemory - Whether memory contains a value
 * @property {string} angleMode - 'DEG' or 'RAD'
 * @property {boolean} isSecondMode - Whether 2nd function mode is active
 * @property {number} openParentheses - Count of unclosed parentheses
 */

/**
 * Calculation result
 * @typedef {Object} CalculationResult
 * @property {number} value - Calculated result
 * @property {string} expression - Expression that was calculated
 * @property {string} [error] - Error message if calculation failed
 */

/**
 * History entry
 * @typedef {Object} HistoryEntry
 * @property {string} expression - The expression that was evaluated
 * @property {number} result - The calculation result
 * @property {number} timestamp - Unix timestamp of when calculation occurred
 */

/**
 * Calculator Model - manages state and performs calculations
 * @class CalculatorModel
 */
class CalculatorModel {
    /**
     * Create a new CalculatorModel instance
     * @constructor
     */
    constructor() {
        this.reset();
        
        /** @type {HistoryEntry[]} Calculation history */
        this.history = [];
        
        /** @type {number} Maximum history entries to keep */
        this.maxHistoryLength = 50;
        
        /** @type {ExpressionParser} Parser for mathematical expressions */
        this.expressionParser = new ExpressionParser({ isDegreeMode: true });
        
        /** @type {ErrorHandler} Error handling utility */
        this.errorHandler = new ErrorHandler();
        
        /** @type {boolean} Whether expression mode is enabled */
        this.expressionMode = false;
        
        /** @type {string|null} Last error that occurred */
        this.lastError = null;
    }
    
    /**
     * Reset calculator to initial state
     */
    reset() {
        this.currentValue = '0';
        this.previousValue = '';
        this.operator = null;
        this.waitingForOperand = false;
        this.memory = 0;
        this.hasMemory = false;
        this.isDegreeMode = true;
        this.isSecondMode = false;
        this.expressionString = '';
        this.openParentheses = 0;
        this.tokens = [];
    }
    
    /**
     * Enable/disable expression mode
     */
    setExpressionMode(enabled) {
        this.expressionMode = enabled;
        if (enabled) {
            this.expressionString = this.currentValue === '0' ? '' : this.currentValue;
        }
    }
    
    /**
     * Get current display state
     */
    getDisplayState() {
        return {
            currentValue: this.currentValue,
            expression: this.getExpressionString(),
            hasMemory: this.hasMemory,
            angleMode: this.isDegreeMode ? 'DEG' : 'RAD',
            isSecondMode: this.isSecondMode,
            expressionMode: this.expressionMode,
            openParentheses: this.openParentheses
        };
    }
    
    /**
     * Get expression string for display
     */
    getExpressionString() {
        if (this.expressionMode) {
            return this.expressionString;
        }
        if (this.operator && this.previousValue) {
            return `${this.previousValue} ${this.operator}`;
        }
        return '';
    }
    
    /**
     * Get full expression including current value (for expression mode)
     */
    getFullExpression() {
        if (this.expressionMode) {
            return this.expressionString;
        }
        if (this.operator && this.previousValue) {
            return `${this.previousValue} ${this.operator} ${this.currentValue}`;
        }
        return this.currentValue;
    }
    
    /**
     * Get current value
     */
    getCurrentValue() {
        return this.currentValue;
    }
    
    /**
     * Set current value directly
     */
    setCurrentValue(value) {
        this.currentValue = String(value);
        this.waitingForOperand = true;
    }
    
    /**
     * Input a digit
     */
    inputDigit(digit) {
        this.clearLastError();
        
        const validation = this.errorHandler.validateInput('digit', this.getContext());
        if (!validation.valid) {
            this.lastError = validation.error;
            return { 
                success: false, 
                error: this.errorHandler.formatError(validation.error),
                errorCode: validation.error,
                blocked: true
            };
        }
        
        if (this.expressionMode) {
            this.expressionString += digit;
            this.currentValue = this.getLastNumber() || digit;
            return { success: true, value: this.currentValue, expression: this.expressionString };
        }
        
        if (this.waitingForOperand) {
            this.currentValue = digit;
            this.waitingForOperand = false;
        } else {
            if (this.currentValue === '0' && digit !== '0') {
                this.currentValue = digit;
            } else if (this.currentValue !== '0' || digit !== '0') {
                if (this.currentValue.replace(/[^0-9]/g, '').length < 15) {
                    this.currentValue += digit;
                } else {
                    return { 
                        success: false, 
                        error: this.errorHandler.formatError('MAX_DIGITS_REACHED'),
                        errorCode: 'MAX_DIGITS_REACHED',
                        blocked: true 
                    };
                }
            }
        }
        return { success: true, value: this.currentValue };
    }
    
    /**
     * Get current context for validation
     */
    getContext() {
        return {
            currentValue: this.currentValue,
            previousValue: this.previousValue,
            operator: this.operator,
            waitingForOperand: this.waitingForOperand,
            expressionMode: this.expressionMode,
            expressionString: this.expressionString,
            openParentheses: this.openParentheses
        };
    }
    
    /**
     * Clear last error
     */
    clearLastError() {
        this.lastError = null;
    }
    
    /**
     * Get last error details
     */
    getLastError() {
        if (!this.lastError) return null;
        return this.errorHandler.getErrorDetails(this.lastError);
    }
    
    /**
     * Input decimal point
     */
    inputDecimal() {
        this.clearLastError();
        
        if (this.expressionMode) {
            const lastNum = this.getLastNumber();
            if (lastNum && lastNum.includes('.')) {
                this.lastError = 'TOO_MANY_DECIMALS';
                return { 
                    success: false, 
                    error: this.errorHandler.formatError('TOO_MANY_DECIMALS'),
                    errorCode: 'TOO_MANY_DECIMALS',
                    blocked: true 
                };
            }
            this.expressionString += lastNum ? '.' : '0.';
            this.currentValue = this.getLastNumber() || '0.';
            return { success: true, value: this.currentValue, expression: this.expressionString };
        }
        
        if (this.waitingForOperand) {
            this.currentValue = '0.';
            this.waitingForOperand = false;
        } else if (!this.currentValue.includes('.')) {
            this.currentValue += '.';
        } else {
            this.lastError = 'TOO_MANY_DECIMALS';
            return { 
                success: false, 
                error: this.errorHandler.formatError('TOO_MANY_DECIMALS'),
                errorCode: 'TOO_MANY_DECIMALS',
                blocked: true 
            };
        }
        return { success: true, value: this.currentValue };
    }
    
    /**
     * Input an operator
     */
    inputOperator(operator) {
        if (this.expressionMode) {
            const normalized = this.normalizeOperator(operator);
            if (this.expressionString.length > 0) {
                const lastChar = this.expressionString.slice(-1);
                if (['+', '-', '*', '/', '×', '÷', '^'].includes(lastChar)) {
                    this.expressionString = this.expressionString.slice(0, -1) + normalized;
                } else {
                    this.expressionString += normalized;
                }
            }
            this.waitingForOperand = true;
            return { success: true, operator: operator, expression: this.expressionString };
        }
        
        const value = parseFloat(this.currentValue);
        
        if (this.operator && !this.waitingForOperand) {
            const result = this.calculate();
            if (!result.success) {
                return result;
            }
        }
        
        this.previousValue = this.currentValue;
        this.operator = operator;
        this.waitingForOperand = true;
        
        return { success: true, operator: operator };
    }
    
    /**
     * Normalize operator symbol
     */
    normalizeOperator(op) {
        const map = { '×': '*', '÷': '/', '−': '-' };
        return map[op] || op;
    }
    
    /**
     * Get last number from expression string
     */
    getLastNumber() {
        const match = this.expressionString.match(/[\d.]+$/);
        return match ? match[0] : null;
    }
    
    /**
     * Calculate result
     */
    calculate() {
        this.clearLastError();
        
        if (this.expressionMode) {
            return this.evaluateExpression();
        }
        
        if (!this.operator || this.waitingForOperand) {
            return { success: true, value: this.currentValue };
        }
        
        const prev = parseFloat(this.previousValue);
        const current = parseFloat(this.currentValue);
        let result;
        let errorCode = null;
        
        switch (this.operator) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '×':
                result = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    errorCode = 'DIVISION_BY_ZERO';
                    this.lastError = errorCode;
                    return { 
                        success: false, 
                        error: this.errorHandler.formatError(errorCode),
                        errorCode: errorCode
                    };
                }
                result = prev / current;
                break;
            case '%':
                if (current === 0) {
                    errorCode = 'MODULO_BY_ZERO';
                    this.lastError = errorCode;
                    return { 
                        success: false, 
                        error: this.errorHandler.formatError(errorCode),
                        errorCode: errorCode
                    };
                }
                result = prev % current;
                break;
            case '^':
                result = Math.pow(prev, current);
                if (!isFinite(result)) {
                    errorCode = 'OVERFLOW';
                    this.lastError = errorCode;
                    return { 
                        success: false, 
                        error: this.errorHandler.formatError(errorCode),
                        errorCode: errorCode
                    };
                }
                break;
            case 'nroot':
                if (current === 0) {
                    errorCode = 'DIVISION_BY_ZERO';
                    this.lastError = errorCode;
                    return { 
                        success: false, 
                        error: 'Корень степени 0 не определён',
                        errorCode: errorCode
                    };
                }
                if (prev < 0 && current % 2 === 0) {
                    errorCode = 'SQRT_NEGATIVE';
                    this.lastError = errorCode;
                    return { 
                        success: false, 
                        error: 'Чётный корень отрицательного числа не определён',
                        errorCode: errorCode
                    };
                }
                result = prev < 0 ? -Math.pow(-prev, 1/current) : Math.pow(prev, 1/current);
                break;
            default:
                errorCode = 'INVALID_EXPRESSION';
                this.lastError = errorCode;
                return { 
                    success: false, 
                    error: this.errorHandler.formatError(errorCode),
                    errorCode: errorCode
                };
        }
        
        const resultValidation = this.errorHandler.validateResult(result);
        if (!resultValidation.valid) {
            this.lastError = resultValidation.error;
            return { 
                success: false, 
                error: this.errorHandler.formatError(resultValidation.error),
                errorCode: resultValidation.error
            };
        }
        
        if (resultValidation.warning) {
            result = resultValidation.value !== undefined ? resultValidation.value : result;
        }
        
        const expression = `${this.previousValue} ${this.operator} ${this.currentValue}`;
        const formattedResult = this.formatNumber(result);
        
        this.addToHistory(expression, formattedResult);
        
        this.currentValue = formattedResult;
        this.operator = null;
        this.previousValue = '';
        this.waitingForOperand = true;
        
        return { 
            success: true, 
            value: formattedResult, 
            expression: expression,
            warning: resultValidation.warning
        };
    }
    
    /**
     * Evaluate full expression using ExpressionParser
     */
    evaluateExpression() {
        if (!this.expressionString || this.expressionString.trim() === '') {
            this.lastError = 'EMPTY_EXPRESSION';
            return { 
                success: false, 
                error: this.errorHandler.formatError('EMPTY_EXPRESSION'),
                errorCode: 'EMPTY_EXPRESSION'
            };
        }
        
        const syntaxValidation = this.errorHandler.validateExpression(this.expressionString);
        if (!syntaxValidation.valid && syntaxValidation.errors.length > 0) {
            const firstError = syntaxValidation.errors[0];
            this.lastError = firstError.code;
            return { 
                success: false, 
                error: this.errorHandler.formatError(firstError.code),
                errorCode: firstError.code,
                position: firstError.position,
                errors: syntaxValidation.errors
            };
        }
        
        this.expressionParser.setDegreeMode(this.isDegreeMode);
        
        const result = this.expressionParser.evaluate(this.expressionString);
        
        if (result.success) {
            const formattedResult = this.formatNumber(result.value);
            this.addToHistory(this.expressionString, formattedResult);
            
            this.currentValue = formattedResult;
            this.expressionString = formattedResult;
            this.openParentheses = 0;
            this.waitingForOperand = true;
            
            return { 
                success: true, 
                value: formattedResult, 
                expression: this.expressionString 
            };
        }
        
        return result;
    }
    
    /**
     * Parse expression string (for validation or display)
     */
    parseExpression(expr) {
        this.expressionParser.setDegreeMode(this.isDegreeMode);
        return this.expressionParser.validate(expr || this.expressionString);
    }
    
    /**
     * Apply scientific function
     */
    applyFunction(func) {
        const value = parseFloat(this.currentValue);
        let result;
        
        try {
            switch (func) {
                case 'sin':
                    result = this.isDegreeMode ? Math.sin(this.toRadians(value)) : Math.sin(value);
                    break;
                case 'cos':
                    result = this.isDegreeMode ? Math.cos(this.toRadians(value)) : Math.cos(value);
                    break;
                case 'tan':
                    const tanArg = this.isDegreeMode ? this.toRadians(value) : value;
                    if (Math.abs(Math.cos(tanArg)) < 1e-10) {
                        return { success: false, error: 'Недопустимое значение' };
                    }
                    result = Math.tan(tanArg);
                    break;
                case 'asin':
                    if (value < -1 || value > 1) {
                        return { success: false, error: 'Значение вне диапазона [-1, 1]' };
                    }
                    result = this.isDegreeMode ? this.toDegrees(Math.asin(value)) : Math.asin(value);
                    break;
                case 'acos':
                    if (value < -1 || value > 1) {
                        return { success: false, error: 'Значение вне диапазона [-1, 1]' };
                    }
                    result = this.isDegreeMode ? this.toDegrees(Math.acos(value)) : Math.acos(value);
                    break;
                case 'atan':
                    result = this.isDegreeMode ? this.toDegrees(Math.atan(value)) : Math.atan(value);
                    break;
                case 'log':
                    if (value <= 0) {
                        return { success: false, error: 'Логарифм неположительного числа' };
                    }
                    result = Math.log10(value);
                    break;
                case 'ln':
                    if (value <= 0) {
                        return { success: false, error: 'Логарифм неположительного числа' };
                    }
                    result = Math.log(value);
                    break;
                case '10x':
                    result = Math.pow(10, value);
                    if (!isFinite(result)) {
                        return { success: false, error: 'Переполнение' };
                    }
                    break;
                case 'ex':
                    result = Math.exp(value);
                    if (!isFinite(result)) {
                        return { success: false, error: 'Переполнение' };
                    }
                    break;
                case 'x2':
                    result = Math.pow(value, 2);
                    break;
                case 'x3':
                    result = Math.pow(value, 3);
                    break;
                case 'xn':
                    this.previousValue = this.currentValue;
                    this.operator = '^';
                    this.waitingForOperand = true;
                    return { success: true, value: this.currentValue, pendingPower: true };
                case 'sqrt':
                    if (value < 0) {
                        return { success: false, error: 'Корень отрицательного числа' };
                    }
                    result = Math.sqrt(value);
                    break;
                case 'cbrt':
                    result = Math.cbrt(value);
                    break;
                case 'nroot':
                    this.previousValue = this.currentValue;
                    this.operator = 'nroot';
                    this.waitingForOperand = true;
                    return { success: true, value: this.currentValue, pendingRoot: true };
                case 'abs':
                    result = Math.abs(value);
                    break;
                case 'factorial':
                    if (value < 0 || !Number.isInteger(value)) {
                        return { success: false, error: 'Факториал определён только для целых неотрицательных чисел' };
                    }
                    if (value > 170) {
                        return { success: false, error: 'Переполнение' };
                    }
                    result = this.factorial(value);
                    break;
                case 'inverse':
                    if (value === 0) {
                        return { success: false, error: 'Деление на ноль' };
                    }
                    result = 1 / value;
                    break;
                case 'exp':
                    this.currentValue += 'e';
                    this.waitingForOperand = false;
                    return { success: true, value: this.currentValue };
                default:
                    return { success: false, error: 'Неизвестная функция' };
            }
            
            this.currentValue = this.formatNumber(result);
            this.waitingForOperand = true;
            
            return { success: true, value: this.currentValue };
        } catch (e) {
            return { success: false, error: e.message || 'Ошибка вычисления' };
        }
    }
    
    /**
     * Insert constant (pi, e)
     */
    insertConstant(constant) {
        const constants = {
            'pi': Math.PI,
            'e': Math.E
        };
        
        const value = constants[constant];
        if (value !== undefined) {
            this.currentValue = this.formatNumber(value);
            this.waitingForOperand = true;
            return { success: true, value: this.currentValue };
        }
        return { success: false, error: 'Неизвестная константа' };
    }
    
    /**
     * Input parenthesis
     */
    inputParenthesis(paren) {
        this.clearLastError();
        
        if (this.expressionMode) {
            if (paren === '(') {
                const lastChar = this.expressionString.slice(-1);
                if (lastChar && /[\d\)]/.test(lastChar)) {
                    this.expressionString += '*(';
                } else {
                    this.expressionString += '(';
                }
                this.openParentheses++;
            } else if (paren === ')') {
                if (this.openParentheses <= 0) {
                    this.lastError = 'UNBALANCED_PARENTHESES';
                    return { 
                        success: false, 
                        error: this.errorHandler.formatError('UNBALANCED_PARENTHESES'),
                        errorCode: 'UNBALANCED_PARENTHESES',
                        blocked: true 
                    };
                }
                this.expressionString += ')';
                this.openParentheses--;
            }
            return { success: true, expression: this.expressionString, openParentheses: this.openParentheses };
        }
        
        if (paren === '(') {
            this.openParentheses++;
        } else if (paren === ')') {
            if (this.openParentheses <= 0) {
                this.lastError = 'UNBALANCED_PARENTHESES';
                return { 
                    success: false, 
                    error: this.errorHandler.formatError('UNBALANCED_PARENTHESES'),
                    errorCode: 'UNBALANCED_PARENTHESES',
                    blocked: true 
                };
            }
            this.openParentheses--;
        }
        return { success: true, openParentheses: this.openParentheses };
    }
    
    /**
     * Input function name (for expression mode)
     */
    inputFunction(funcName) {
        if (this.expressionMode) {
            const lastChar = this.expressionString.slice(-1);
            if (lastChar && /[\d\)]/.test(lastChar)) {
                this.expressionString += '*' + funcName + '(';
            } else {
                this.expressionString += funcName + '(';
            }
            this.openParentheses++;
            this.waitingForOperand = false;
            return { success: true, expression: this.expressionString };
        }
        
        return this.applyFunction(funcName);
    }
    
    /**
     * Input constant (for expression mode)
     */
    inputConstantExpr(constant) {
        if (this.expressionMode) {
            const lastChar = this.expressionString.slice(-1);
            if (lastChar && /[\d\)]/.test(lastChar)) {
                this.expressionString += '*' + constant;
            } else {
                this.expressionString += constant;
            }
            
            const constants = { 'π': Math.PI, 'pi': Math.PI, 'e': Math.E };
            this.currentValue = this.formatNumber(constants[constant] || 0);
            return { success: true, expression: this.expressionString, value: this.currentValue };
        }
        
        return this.insertConstant(constant);
    }
    
    /**
     * Negate current value
     */
    negate() {
        const value = parseFloat(this.currentValue);
        this.currentValue = this.formatNumber(-value);
        return { success: true, value: this.currentValue };
    }
    
    /**
     * Calculate percentage
     */
    percent() {
        const value = parseFloat(this.currentValue);
        
        if (this.previousValue && this.operator) {
            const prev = parseFloat(this.previousValue);
            this.currentValue = this.formatNumber(prev * value / 100);
        } else {
            this.currentValue = this.formatNumber(value / 100);
        }
        
        return { success: true, value: this.currentValue };
    }
    
    /**
     * Clear calculator
     */
    clear() {
        this.currentValue = '0';
        this.previousValue = '';
        this.operator = null;
        this.waitingForOperand = false;
        this.expressionString = '';
        this.openParentheses = 0;
        return { success: true };
    }
    
    /**
     * Clear entry (CE) - clear only current input
     */
    clearEntry() {
        if (this.expressionMode) {
            const match = this.expressionString.match(/(.*?)[\d.]+$/);
            if (match) {
                this.expressionString = match[1];
            }
            this.currentValue = '0';
            return { success: true, expression: this.expressionString };
        }
        
        this.currentValue = '0';
        return { success: true, value: this.currentValue };
    }
    
    /**
     * Backspace - remove last character
     */
    backspace() {
        if (this.expressionMode) {
            if (this.expressionString.length > 0) {
                const lastChar = this.expressionString.slice(-1);
                this.expressionString = this.expressionString.slice(0, -1);
                
                if (lastChar === '(') {
                    this.openParentheses--;
                } else if (lastChar === ')') {
                    this.openParentheses++;
                }
                
                this.currentValue = this.getLastNumber() || '0';
            }
            return { success: true, value: this.currentValue, expression: this.expressionString };
        }
        
        if (this.waitingForOperand) {
            return { success: true, value: this.currentValue };
        }
        
        if (this.currentValue.length > 1) {
            this.currentValue = this.currentValue.slice(0, -1);
            if (this.currentValue === '-') {
                this.currentValue = '0';
            }
        } else {
            this.currentValue = '0';
        }
        
        return { success: true, value: this.currentValue };
    }
    
    /**
     * Memory operations
     */
    memoryClear() {
        this.memory = 0;
        this.hasMemory = false;
        return { success: true };
    }
    
    memoryRecall() {
        if (this.hasMemory) {
            this.currentValue = this.formatNumber(this.memory);
            this.waitingForOperand = true;
        }
        return { success: true, value: this.currentValue };
    }
    
    memoryAdd() {
        this.memory += parseFloat(this.currentValue);
        this.hasMemory = true;
        return { success: true, memory: this.memory };
    }
    
    memorySubtract() {
        this.memory -= parseFloat(this.currentValue);
        this.hasMemory = true;
        return { success: true, memory: this.memory };
    }
    
    memoryStore() {
        this.memory = parseFloat(this.currentValue);
        this.hasMemory = true;
        return { success: true, memory: this.memory };
    }
    
    /**
     * Set angle mode (deg/rad)
     */
    setAngleMode(mode) {
        this.isDegreeMode = mode === 'deg';
        this.expressionParser.setDegreeMode(this.isDegreeMode);
        return { success: true, mode: this.isDegreeMode ? 'DEG' : 'RAD' };
    }
    
    /**
     * Toggle second function mode
     */
    toggleSecondMode() {
        this.isSecondMode = !this.isSecondMode;
        return this.isSecondMode;
    }
    
    /**
     * History operations
     */
    addToHistory(expression, result) {
        this.history.unshift({
            expression: expression,
            result: result,
            timestamp: Date.now()
        });
        
        if (this.history.length > this.maxHistoryLength) {
            this.history.pop();
        }
    }
    
    getHistory() {
        return this.history;
    }
    
    getHistoryItem(index) {
        return this.history[index] || null;
    }
    
    clearHistory() {
        this.history = [];
    }
    
    /**
     * Helper functions
     */
    toRadians(degrees) {
        return degrees * Math.PI / 180;
    }
    
    toDegrees(radians) {
        return radians * 180 / Math.PI;
    }
    
    factorial(n) {
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }
    
    formatNumber(num) {
        if (typeof num === 'string') {
            num = parseFloat(num);
        }
        
        if (isNaN(num)) {
            return 'Ошибка';
        }
        
        if (!isFinite(num)) {
            return num > 0 ? '∞' : '-∞';
        }
        
        if (Math.abs(num) > 1e15 || (Math.abs(num) < 1e-10 && num !== 0)) {
            return num.toExponential(10).replace(/\.?0+e/, 'e');
        }
        
        const rounded = parseFloat(num.toPrecision(15));
        let str = String(rounded);
        
        if (str.includes('.') && str.length > 15) {
            const parts = str.split('.');
            const maxDecimals = 15 - parts[0].length - 1;
            if (maxDecimals > 0) {
                str = rounded.toFixed(Math.min(maxDecimals, 10)).replace(/\.?0+$/, '');
            }
        }
        
        return str;
    }
    
    /**
     * Export state for persistence
     */
    exportState() {
        return {
            currentValue: this.currentValue,
            previousValue: this.previousValue,
            operator: this.operator,
            memory: this.memory,
            hasMemory: this.hasMemory,
            isDegreeMode: this.isDegreeMode,
            history: this.history,
            expressionMode: this.expressionMode,
            expressionString: this.expressionString
        };
    }
    
    /**
     * Import state from persistence
     */
    importState(state) {
        if (!state) return;
        
        this.currentValue = state.currentValue || '0';
        this.previousValue = state.previousValue || '';
        this.operator = state.operator || null;
        this.memory = state.memory || 0;
        this.hasMemory = state.hasMemory || false;
        this.isDegreeMode = state.isDegreeMode !== false;
        this.history = state.history || [];
        this.expressionMode = state.expressionMode || false;
        this.expressionString = state.expressionString || '';
        
        this.expressionParser.setDegreeMode(this.isDegreeMode);
    }
    
    /**
     * Get supported functions list
     */
    getSupportedFunctions() {
        return this.expressionParser.getSupportedFunctions();
    }
    
    /**
     * Get supported constants
     */
    getSupportedConstants() {
        return this.expressionParser.getSupportedConstants();
    }
}

export { CalculatorModel };
