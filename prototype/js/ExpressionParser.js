/**
 * ExpressionParser - Parses and evaluates mathematical expressions
 * 
 * Features:
 * - Tokenization of infix expressions
 * - Shunting-yard algorithm for infix to postfix conversion
 * - Postfix evaluation with support for:
 *   - Basic operators (+, -, *, /, ^, %)
 *   - Parentheses with proper nesting
 *   - Unary minus/plus
 *   - Scientific functions (sin, cos, tan, log, ln, sqrt, etc.)
 *   - Constants (π, e)
 */

class ExpressionParser {
    constructor(options = {}) {
        this.isDegreeMode = options.isDegreeMode !== false;
        
        this.operators = {
            '+': { precedence: 2, associativity: 'left', fn: (a, b) => a + b },
            '-': { precedence: 2, associativity: 'left', fn: (a, b) => a - b },
            '*': { precedence: 3, associativity: 'left', fn: (a, b) => a * b },
            '×': { precedence: 3, associativity: 'left', fn: (a, b) => a * b },
            '/': { precedence: 3, associativity: 'left', fn: (a, b) => {
                if (b === 0) throw new Error('Деление на ноль');
                return a / b;
            }},
            '÷': { precedence: 3, associativity: 'left', fn: (a, b) => {
                if (b === 0) throw new Error('Деление на ноль');
                return a / b;
            }},
            '%': { precedence: 3, associativity: 'left', fn: (a, b) => a % b },
            '^': { precedence: 4, associativity: 'right', fn: (a, b) => Math.pow(a, b) },
            '**': { precedence: 4, associativity: 'right', fn: (a, b) => Math.pow(a, b) },
        };
        
        this.functions = this.createFunctionMap();
        
        this.constants = {
            'π': Math.PI,
            'pi': Math.PI,
            'PI': Math.PI,
            'e': Math.E,
            'E': Math.E,
            'φ': (1 + Math.sqrt(5)) / 2,
            'phi': (1 + Math.sqrt(5)) / 2,
        };
        
        this.unaryOperators = {
            '+': (a) => a,
            '-': (a) => -a,
        };
    }
    
    /**
     * Create map of supported mathematical functions
     */
    createFunctionMap() {
        const self = this;
        
        return {
            'sin': {
                arity: 1,
                fn: (x) => self.isDegreeMode ? Math.sin(self.toRadians(x)) : Math.sin(x)
            },
            'cos': {
                arity: 1,
                fn: (x) => self.isDegreeMode ? Math.cos(self.toRadians(x)) : Math.cos(x)
            },
            'tan': {
                arity: 1,
                fn: (x) => {
                    const arg = self.isDegreeMode ? self.toRadians(x) : x;
                    if (Math.abs(Math.cos(arg)) < 1e-10) {
                        throw new Error('Тангенс не определён');
                    }
                    return Math.tan(arg);
                }
            },
            'cot': {
                arity: 1,
                fn: (x) => {
                    const arg = self.isDegreeMode ? self.toRadians(x) : x;
                    const sinVal = Math.sin(arg);
                    if (Math.abs(sinVal) < 1e-10) {
                        throw new Error('Котангенс не определён');
                    }
                    return Math.cos(arg) / sinVal;
                }
            },
            'sec': {
                arity: 1,
                fn: (x) => {
                    const arg = self.isDegreeMode ? self.toRadians(x) : x;
                    const cosVal = Math.cos(arg);
                    if (Math.abs(cosVal) < 1e-10) {
                        throw new Error('Секанс не определён');
                    }
                    return 1 / cosVal;
                }
            },
            'csc': {
                arity: 1,
                fn: (x) => {
                    const arg = self.isDegreeMode ? self.toRadians(x) : x;
                    const sinVal = Math.sin(arg);
                    if (Math.abs(sinVal) < 1e-10) {
                        throw new Error('Косеканс не определён');
                    }
                    return 1 / sinVal;
                }
            },
            'asin': {
                arity: 1,
                fn: (x) => {
                    if (x < -1 || x > 1) throw new Error('Аргумент asin вне [-1, 1]');
                    const result = Math.asin(x);
                    return self.isDegreeMode ? self.toDegrees(result) : result;
                }
            },
            'acos': {
                arity: 1,
                fn: (x) => {
                    if (x < -1 || x > 1) throw new Error('Аргумент acos вне [-1, 1]');
                    const result = Math.acos(x);
                    return self.isDegreeMode ? self.toDegrees(result) : result;
                }
            },
            'atan': {
                arity: 1,
                fn: (x) => {
                    const result = Math.atan(x);
                    return self.isDegreeMode ? self.toDegrees(result) : result;
                }
            },
            'atan2': {
                arity: 2,
                fn: (y, x) => {
                    const result = Math.atan2(y, x);
                    return self.isDegreeMode ? self.toDegrees(result) : result;
                }
            },
            'sinh': { arity: 1, fn: Math.sinh },
            'cosh': { arity: 1, fn: Math.cosh },
            'tanh': { arity: 1, fn: Math.tanh },
            'asinh': { arity: 1, fn: Math.asinh },
            'acosh': {
                arity: 1,
                fn: (x) => {
                    if (x < 1) throw new Error('Аргумент acosh должен быть >= 1');
                    return Math.acosh(x);
                }
            },
            'atanh': {
                arity: 1,
                fn: (x) => {
                    if (x <= -1 || x >= 1) throw new Error('Аргумент atanh должен быть в (-1, 1)');
                    return Math.atanh(x);
                }
            },
            'log': {
                arity: 1,
                fn: (x) => {
                    if (x <= 0) throw new Error('Логарифм неположительного числа');
                    return Math.log10(x);
                }
            },
            'log10': {
                arity: 1,
                fn: (x) => {
                    if (x <= 0) throw new Error('Логарифм неположительного числа');
                    return Math.log10(x);
                }
            },
            'ln': {
                arity: 1,
                fn: (x) => {
                    if (x <= 0) throw new Error('Логарифм неположительного числа');
                    return Math.log(x);
                }
            },
            'log2': {
                arity: 1,
                fn: (x) => {
                    if (x <= 0) throw new Error('Логарифм неположительного числа');
                    return Math.log2(x);
                }
            },
            'logb': {
                arity: 2,
                fn: (x, base) => {
                    if (x <= 0 || base <= 0 || base === 1) {
                        throw new Error('Недопустимые аргументы логарифма');
                    }
                    return Math.log(x) / Math.log(base);
                }
            },
            'exp': { arity: 1, fn: Math.exp },
            'pow': { arity: 2, fn: Math.pow },
            'sqrt': {
                arity: 1,
                fn: (x) => {
                    if (x < 0) throw new Error('Корень отрицательного числа');
                    return Math.sqrt(x);
                }
            },
            'cbrt': { arity: 1, fn: Math.cbrt },
            'nroot': {
                arity: 2,
                fn: (x, n) => {
                    if (n === 0) throw new Error('Корень степени 0');
                    if (x < 0 && n % 2 === 0) throw new Error('Чётный корень отрицательного числа');
                    return x < 0 ? -Math.pow(-x, 1/n) : Math.pow(x, 1/n);
                }
            },
            'abs': { arity: 1, fn: Math.abs },
            'sign': { arity: 1, fn: Math.sign },
            'floor': { arity: 1, fn: Math.floor },
            'ceil': { arity: 1, fn: Math.ceil },
            'round': { arity: 1, fn: Math.round },
            'trunc': { arity: 1, fn: Math.trunc },
            'frac': { arity: 1, fn: (x) => x - Math.trunc(x) },
            'fact': {
                arity: 1,
                fn: (n) => {
                    if (n < 0 || !Number.isInteger(n)) {
                        throw new Error('Факториал определён для целых неотрицательных');
                    }
                    if (n > 170) throw new Error('Переполнение факториала');
                    let result = 1;
                    for (let i = 2; i <= n; i++) result *= i;
                    return result;
                }
            },
            'factorial': {
                arity: 1,
                fn: (n) => {
                    if (n < 0 || !Number.isInteger(n)) {
                        throw new Error('Факториал определён для целых неотрицательных');
                    }
                    if (n > 170) throw new Error('Переполнение факториала');
                    let result = 1;
                    for (let i = 2; i <= n; i++) result *= i;
                    return result;
                }
            },
            'gcd': {
                arity: 2,
                fn: (a, b) => {
                    a = Math.abs(Math.round(a));
                    b = Math.abs(Math.round(b));
                    while (b) { [a, b] = [b, a % b]; }
                    return a;
                }
            },
            'lcm': {
                arity: 2,
                fn: (a, b) => {
                    a = Math.abs(Math.round(a));
                    b = Math.abs(Math.round(b));
                    if (a === 0 || b === 0) return 0;
                    let gcd = a, temp = b;
                    while (temp) { [gcd, temp] = [temp, gcd % temp]; }
                    return (a * b) / gcd;
                }
            },
            'min': { arity: 2, fn: Math.min },
            'max': { arity: 2, fn: Math.max },
            'mod': { arity: 2, fn: (a, b) => ((a % b) + b) % b },
            'deg': { arity: 1, fn: (x) => x * 180 / Math.PI },
            'rad': { arity: 1, fn: (x) => x * Math.PI / 180 },
        };
    }
    
    /**
     * Set angle mode
     */
    setDegreeMode(isDegree) {
        this.isDegreeMode = isDegree;
        this.functions = this.createFunctionMap();
    }
    
    /**
     * Convert degrees to radians
     */
    toRadians(degrees) {
        return degrees * Math.PI / 180;
    }
    
    /**
     * Convert radians to degrees
     */
    toDegrees(radians) {
        return radians * 180 / Math.PI;
    }
    
    /**
     * Tokenize an expression string
     * @param {string} expression - The mathematical expression
     * @returns {Array} Array of tokens
     */
    tokenize(expression) {
        const tokens = [];
        let i = 0;
        const expr = expression.replace(/\s+/g, '');
        
        while (i < expr.length) {
            const char = expr[i];
            
            if (this.isDigit(char) || char === '.') {
                let numStr = '';
                while (i < expr.length && (this.isDigit(expr[i]) || expr[i] === '.')) {
                    numStr += expr[i];
                    i++;
                }
                if (i < expr.length && (expr[i] === 'e' || expr[i] === 'E')) {
                    const nextChar = expr[i + 1];
                    if (nextChar && (this.isDigit(nextChar) || nextChar === '+' || nextChar === '-')) {
                        numStr += expr[i];
                        i++;
                        if (expr[i] === '+' || expr[i] === '-') {
                            numStr += expr[i];
                            i++;
                        }
                        while (i < expr.length && this.isDigit(expr[i])) {
                            numStr += expr[i];
                            i++;
                        }
                    }
                }
                tokens.push({ type: 'number', value: parseFloat(numStr) });
                continue;
            }
            
            if (this.isLetter(char)) {
                let name = '';
                while (i < expr.length && (this.isLetter(expr[i]) || this.isDigit(expr[i]))) {
                    name += expr[i];
                    i++;
                }
                
                if (this.constants[name] !== undefined) {
                    tokens.push({ type: 'number', value: this.constants[name] });
                } else if (this.functions[name]) {
                    tokens.push({ type: 'function', value: name });
                } else {
                    throw new Error(`Неизвестный идентификатор: ${name}`);
                }
                continue;
            }
            
            if (char === 'π') {
                tokens.push({ type: 'number', value: Math.PI });
                i++;
                continue;
            }
            
            if (char === '(') {
                tokens.push({ type: 'lparen', value: '(' });
                i++;
                continue;
            }
            
            if (char === ')') {
                tokens.push({ type: 'rparen', value: ')' });
                i++;
                continue;
            }
            
            if (char === ',') {
                tokens.push({ type: 'comma', value: ',' });
                i++;
                continue;
            }
            
            if (char === '!') {
                tokens.push({ type: 'postfix', value: '!' });
                i++;
                continue;
            }
            
            if (char === '*' && i + 1 < expr.length && expr[i + 1] === '*') {
                tokens.push({ type: 'operator', value: '**' });
                i += 2;
                continue;
            }
            
            if (this.operators[char]) {
                const lastToken = tokens[tokens.length - 1];
                const isUnary = !lastToken || 
                               lastToken.type === 'lparen' || 
                               lastToken.type === 'operator' ||
                               lastToken.type === 'comma';
                
                if (isUnary && (char === '+' || char === '-')) {
                    tokens.push({ type: 'unary', value: char });
                } else {
                    tokens.push({ type: 'operator', value: char });
                }
                i++;
                continue;
            }
            
            throw new Error(`Неизвестный символ: ${char}`);
        }
        
        return tokens;
    }
    
    /**
     * Check if character is a digit
     */
    isDigit(char) {
        return char >= '0' && char <= '9';
    }
    
    /**
     * Check if character is a letter
     */
    isLetter(char) {
        return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || char === '_';
    }
    
    /**
     * Convert infix tokens to postfix using Shunting-yard algorithm
     * @param {Array} tokens - Array of tokens in infix notation
     * @returns {Array} Array of tokens in postfix notation
     */
    toPostfix(tokens) {
        const output = [];
        const operatorStack = [];
        
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            
            switch (token.type) {
                case 'number':
                    output.push(token);
                    break;
                    
                case 'function':
                    operatorStack.push(token);
                    break;
                    
                case 'unary':
                    operatorStack.push({ type: 'unary', value: token.value, precedence: 5 });
                    break;
                    
                case 'postfix':
                    output.push(token);
                    break;
                    
                case 'operator':
                    const op = this.operators[token.value];
                    
                    while (operatorStack.length > 0) {
                        const top = operatorStack[operatorStack.length - 1];
                        
                        if (top.type === 'lparen') break;
                        
                        if (top.type === 'function') {
                            output.push(operatorStack.pop());
                            continue;
                        }
                        
                        if (top.type === 'unary') {
                            output.push(operatorStack.pop());
                            continue;
                        }
                        
                        const topOp = this.operators[top.value];
                        if (!topOp) break;
                        
                        if ((op.associativity === 'left' && op.precedence <= topOp.precedence) ||
                            (op.associativity === 'right' && op.precedence < topOp.precedence)) {
                            output.push(operatorStack.pop());
                        } else {
                            break;
                        }
                    }
                    
                    operatorStack.push(token);
                    break;
                    
                case 'lparen':
                    operatorStack.push(token);
                    break;
                    
                case 'rparen':
                    while (operatorStack.length > 0 && 
                           operatorStack[operatorStack.length - 1].type !== 'lparen') {
                        output.push(operatorStack.pop());
                    }
                    
                    if (operatorStack.length === 0) {
                        throw new Error('Несбалансированные скобки');
                    }
                    
                    operatorStack.pop();
                    
                    if (operatorStack.length > 0 && 
                        operatorStack[operatorStack.length - 1].type === 'function') {
                        output.push(operatorStack.pop());
                    }
                    break;
                    
                case 'comma':
                    while (operatorStack.length > 0 && 
                           operatorStack[operatorStack.length - 1].type !== 'lparen') {
                        output.push(operatorStack.pop());
                    }
                    
                    if (operatorStack.length === 0) {
                        throw new Error('Неправильное использование запятой');
                    }
                    break;
            }
        }
        
        while (operatorStack.length > 0) {
            const top = operatorStack.pop();
            if (top.type === 'lparen') {
                throw new Error('Несбалансированные скобки');
            }
            output.push(top);
        }
        
        return output;
    }
    
    /**
     * Evaluate postfix expression
     * @param {Array} postfix - Array of tokens in postfix notation
     * @returns {number} Result of evaluation
     */
    evaluatePostfix(postfix) {
        const stack = [];
        
        for (const token of postfix) {
            switch (token.type) {
                case 'number':
                    stack.push(token.value);
                    break;
                    
                case 'operator':
                    if (stack.length < 2) {
                        throw new Error('Недостаточно операндов');
                    }
                    const b = stack.pop();
                    const a = stack.pop();
                    const op = this.operators[token.value];
                    stack.push(op.fn(a, b));
                    break;
                    
                case 'unary':
                    if (stack.length < 1) {
                        throw new Error('Недостаточно операндов для унарного оператора');
                    }
                    const operand = stack.pop();
                    stack.push(this.unaryOperators[token.value](operand));
                    break;
                    
                case 'postfix':
                    if (token.value === '!') {
                        if (stack.length < 1) {
                            throw new Error('Недостаточно операндов для факториала');
                        }
                        const n = stack.pop();
                        stack.push(this.functions['factorial'].fn(n));
                    }
                    break;
                    
                case 'function':
                    const func = this.functions[token.value];
                    if (!func) {
                        throw new Error(`Неизвестная функция: ${token.value}`);
                    }
                    
                    if (stack.length < func.arity) {
                        throw new Error(`Недостаточно аргументов для функции ${token.value}`);
                    }
                    
                    const args = [];
                    for (let i = 0; i < func.arity; i++) {
                        args.unshift(stack.pop());
                    }
                    
                    stack.push(func.fn(...args));
                    break;
            }
        }
        
        if (stack.length !== 1) {
            throw new Error('Некорректное выражение');
        }
        
        return stack[0];
    }
    
    /**
     * Parse and evaluate an expression
     * @param {string} expression - The mathematical expression
     * @returns {Object} Result object with value or error
     */
    evaluate(expression) {
        try {
            if (!expression || expression.trim() === '') {
                return { success: false, error: 'Пустое выражение' };
            }
            
            const normalizedExpr = this.normalizeExpression(expression);
            
            const tokens = this.tokenize(normalizedExpr);
            
            if (tokens.length === 0) {
                return { success: false, error: 'Пустое выражение' };
            }
            
            const postfix = this.toPostfix(tokens);
            
            const result = this.evaluatePostfix(postfix);
            
            if (!isFinite(result)) {
                if (isNaN(result)) {
                    return { success: false, error: 'Результат не определён' };
                }
                return { success: true, value: result > 0 ? Infinity : -Infinity };
            }
            
            return { success: true, value: result };
            
        } catch (e) {
            return { success: false, error: e.message || 'Ошибка вычисления' };
        }
    }
    
    /**
     * Normalize expression for parsing
     * @param {string} expr - Raw expression
     * @returns {string} Normalized expression
     */
    normalizeExpression(expr) {
        let result = expr
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/−/g, '-')
            .replace(/\s+/g, '')
            .replace(/\)\(/g, ')*(')
            .replace(/\)(\d)/g, ')*$1');
        
        result = result.replace(/([a-zA-Z][a-zA-Z0-9]*)\(/g, (match, funcName) => {
            if (this.functions[funcName] || this.constants[funcName] !== undefined) {
                return match;
            }
            return match;
        });
        
        result = result.replace(/(\d)\(/g, (match, digit, offset) => {
            const before = result.substring(0, offset);
            if (/[a-zA-Z0-9]$/.test(before) && /[a-zA-Z]/.test(before.slice(-2, -1) || '')) {
                return match;
            }
            return digit + '*(';
        });
        
        result = result.replace(/(\d)(π|pi|sin|cos|tan|cot|sec|csc|asin|acos|atan|sinh|cosh|tanh|asinh|acosh|atanh|ln|sqrt|cbrt|abs|floor|ceil|round|exp|fact|gcd|lcm|min|max|mod)/gi, '$1*$2');
        
        result = result.replace(/(\d)(log)(?![0-9a-z])/gi, '$1*$2');
        
        result = result.replace(/(\d)e(?![+-]?\d)/gi, '$1*e');
        
        result = result
            .replace(/(π|pi)\(/g, '$1*(')
            .replace(/\)(π|pi)/g, ')*$1');
        
        result = result.replace(/([^a-zA-Z])e\(/g, '$1e*(');
        result = result.replace(/\)e([^+-]|$)/g, ')*e$1');
        
        return result;
    }
    
    /**
     * Validate expression syntax without evaluating
     * @param {string} expression - The expression to validate
     * @returns {Object} Validation result
     */
    validate(expression) {
        try {
            const normalizedExpr = this.normalizeExpression(expression);
            const tokens = this.tokenize(normalizedExpr);
            this.toPostfix(tokens);
            return { valid: true };
        } catch (e) {
            return { valid: false, error: e.message };
        }
    }
    
    /**
     * Get list of supported functions
     * @returns {Array} List of function names
     */
    getSupportedFunctions() {
        return Object.keys(this.functions);
    }
    
    /**
     * Get list of supported constants
     * @returns {Object} Map of constant names to values
     */
    getSupportedConstants() {
        return { ...this.constants };
    }
}

export { ExpressionParser };
