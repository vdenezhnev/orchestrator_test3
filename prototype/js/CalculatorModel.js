/**
 * CalculatorModel - Manages calculator state and business logic
 * Implements the Model part of MVC pattern
 */

class CalculatorModel {
    constructor() {
        this.reset();
        this.history = [];
        this.maxHistoryLength = 50;
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
        this.expression = '';
        this.openParentheses = 0;
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
            isSecondMode: this.isSecondMode
        };
    }
    
    /**
     * Get expression string for display
     */
    getExpressionString() {
        if (this.operator && this.previousValue) {
            return `${this.previousValue} ${this.operator}`;
        }
        return this.expression || '';
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
        if (this.waitingForOperand) {
            this.currentValue = digit;
            this.waitingForOperand = false;
        } else {
            if (this.currentValue === '0' && digit !== '0') {
                this.currentValue = digit;
            } else if (this.currentValue !== '0' || digit !== '0') {
                if (this.currentValue.replace(/[^0-9]/g, '').length < 15) {
                    this.currentValue += digit;
                }
            }
        }
        return { success: true, value: this.currentValue };
    }
    
    /**
     * Input decimal point
     */
    inputDecimal() {
        if (this.waitingForOperand) {
            this.currentValue = '0.';
            this.waitingForOperand = false;
        } else if (!this.currentValue.includes('.')) {
            this.currentValue += '.';
        }
        return { success: true, value: this.currentValue };
    }
    
    /**
     * Input an operator
     */
    inputOperator(operator) {
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
     * Calculate result
     */
    calculate() {
        if (!this.operator || this.waitingForOperand) {
            return { success: true, value: this.currentValue };
        }
        
        const prev = parseFloat(this.previousValue);
        const current = parseFloat(this.currentValue);
        let result;
        
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
                    return { success: false, error: 'Деление на ноль' };
                }
                result = prev / current;
                break;
            default:
                return { success: false, error: 'Неизвестный оператор' };
        }
        
        const expression = `${this.previousValue} ${this.operator} ${this.currentValue}`;
        const formattedResult = this.formatNumber(result);
        
        this.addToHistory(expression, formattedResult);
        
        this.currentValue = formattedResult;
        this.operator = null;
        this.previousValue = '';
        this.waitingForOperand = true;
        this.expression = '';
        
        return { success: true, value: formattedResult, expression: expression };
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
        if (paren === '(') {
            this.expression += '(';
            this.openParentheses++;
        } else if (paren === ')' && this.openParentheses > 0) {
            this.expression += ')';
            this.openParentheses--;
        }
        return { success: true };
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
        this.expression = '';
        this.openParentheses = 0;
        return { success: true };
    }
    
    /**
     * Backspace - remove last character
     */
    backspace() {
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
            history: this.history
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
    }
}

export { CalculatorModel };
