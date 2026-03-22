/**
 * Engineering Calculator - Prototype Script
 * This is a basic prototype demonstrating UI interactions
 */

class Calculator {
    constructor() {
        this.currentValue = '0';
        this.previousValue = '';
        this.operator = null;
        this.waitingForOperand = false;
        this.memory = 0;
        this.hasMemory = false;
        this.isDegreeMode = true;
        this.isSecondMode = false;
        this.history = [];
        
        this.init();
    }
    
    init() {
        this.bindElements();
        this.bindEvents();
        this.updateDisplay();
    }
    
    bindElements() {
        this.calculator = document.getElementById('calculator');
        this.expressionDisplay = document.getElementById('expression');
        this.resultDisplay = document.getElementById('result');
        this.memoryIndicator = document.getElementById('memoryIndicator');
        this.modeIndicator = document.getElementById('modeIndicator');
        this.themeToggle = document.getElementById('themeToggle');
        this.historyToggle = document.getElementById('historyToggle');
        this.historyPanel = document.getElementById('historyPanel');
        this.historyList = document.getElementById('historyList');
        this.historyClear = document.getElementById('historyClear');
        this.secondBtn = document.getElementById('secondBtn');
    }
    
    bindEvents() {
        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // History toggle
        this.historyToggle.addEventListener('click', () => this.toggleHistory());
        this.historyClear.addEventListener('click', () => this.clearHistory());
        
        // Second function toggle
        this.secondBtn.addEventListener('click', () => this.toggleSecond());
        
        // Mode buttons (DEG/RAD)
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setMode(e.target.dataset.mode));
        });
        
        // All calculator buttons
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleButton(e.target));
        });
        
        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }
    
    toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('calculator-theme', newTheme);
    }
    
    toggleHistory() {
        this.historyPanel.classList.toggle('active');
    }
    
    toggleSecond() {
        this.isSecondMode = !this.isSecondMode;
        this.secondBtn.classList.toggle('active', this.isSecondMode);
    }
    
    setMode(mode) {
        this.isDegreeMode = mode === 'deg';
        this.modeIndicator.textContent = mode.toUpperCase();
        
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
    }
    
    handleButton(button) {
        if (button.dataset.digit !== undefined) {
            this.inputDigit(button.dataset.digit);
        } else if (button.dataset.action) {
            this.handleAction(button.dataset.action);
        }
    }
    
    inputDigit(digit) {
        if (this.waitingForOperand) {
            this.currentValue = digit;
            this.waitingForOperand = false;
        } else {
            this.currentValue = this.currentValue === '0' ? digit : this.currentValue + digit;
        }
        this.updateDisplay();
    }
    
    handleAction(action) {
        switch (action) {
            // Basic operations
            case 'add':
                this.handleOperator('+');
                break;
            case 'subtract':
                this.handleOperator('-');
                break;
            case 'multiply':
                this.handleOperator('×');
                break;
            case 'divide':
                this.handleOperator('÷');
                break;
            case 'equals':
                this.calculate();
                break;
            case 'clear':
                this.clear();
                break;
            case 'decimal':
                this.inputDecimal();
                break;
            case 'negate':
                this.negate();
                break;
            case 'percent':
                this.percent();
                break;
            
            // Memory operations
            case 'mc':
                this.memoryClear();
                break;
            case 'mr':
                this.memoryRecall();
                break;
            case 'm-plus':
                this.memoryAdd();
                break;
            case 'm-minus':
                this.memorySubtract();
                break;
            case 'ms':
                this.memoryStore();
                break;
            
            // Scientific functions
            case 'sin':
                this.applyFunction('sin');
                break;
            case 'cos':
                this.applyFunction('cos');
                break;
            case 'tan':
                this.applyFunction('tan');
                break;
            case 'asin':
                this.applyFunction('asin');
                break;
            case 'acos':
                this.applyFunction('acos');
                break;
            case 'atan':
                this.applyFunction('atan');
                break;
            case 'log':
                this.applyFunction('log');
                break;
            case 'ln':
                this.applyFunction('ln');
                break;
            case '10x':
                this.applyFunction('10x');
                break;
            case 'ex':
                this.applyFunction('ex');
                break;
            case 'x2':
                this.applyFunction('x2');
                break;
            case 'x3':
                this.applyFunction('x3');
                break;
            case 'sqrt':
                this.applyFunction('sqrt');
                break;
            case 'cbrt':
                this.applyFunction('cbrt');
                break;
            case 'abs':
                this.applyFunction('abs');
                break;
            case 'factorial':
                this.applyFunction('factorial');
                break;
            case 'inverse':
                this.applyFunction('inverse');
                break;
            case 'pi':
                this.insertConstant(Math.PI);
                break;
            case 'e':
                this.insertConstant(Math.E);
                break;
            case 'lparen':
                this.inputParenthesis('(');
                break;
            case 'rparen':
                this.inputParenthesis(')');
                break;
        }
    }
    
    handleOperator(op) {
        const value = parseFloat(this.currentValue);
        
        if (this.operator && !this.waitingForOperand) {
            this.calculate();
        }
        
        this.previousValue = this.currentValue;
        this.operator = op;
        this.waitingForOperand = true;
        this.updateExpression();
    }
    
    calculate() {
        if (!this.operator || this.waitingForOperand) return;
        
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
                    this.showError('Division by zero');
                    return;
                }
                result = prev / current;
                break;
        }
        
        const expression = `${this.previousValue} ${this.operator} ${this.currentValue}`;
        this.addToHistory(expression, result);
        
        this.currentValue = this.formatNumber(result);
        this.operator = null;
        this.previousValue = '';
        this.waitingForOperand = true;
        this.updateDisplay();
        this.updateExpression();
    }
    
    applyFunction(func) {
        const value = parseFloat(this.currentValue);
        let result;
        
        try {
            switch (func) {
                case 'sin':
                    result = this.isDegreeMode ? Math.sin(value * Math.PI / 180) : Math.sin(value);
                    break;
                case 'cos':
                    result = this.isDegreeMode ? Math.cos(value * Math.PI / 180) : Math.cos(value);
                    break;
                case 'tan':
                    result = this.isDegreeMode ? Math.tan(value * Math.PI / 180) : Math.tan(value);
                    break;
                case 'asin':
                    if (value < -1 || value > 1) throw new Error('Invalid input');
                    result = this.isDegreeMode ? Math.asin(value) * 180 / Math.PI : Math.asin(value);
                    break;
                case 'acos':
                    if (value < -1 || value > 1) throw new Error('Invalid input');
                    result = this.isDegreeMode ? Math.acos(value) * 180 / Math.PI : Math.acos(value);
                    break;
                case 'atan':
                    result = this.isDegreeMode ? Math.atan(value) * 180 / Math.PI : Math.atan(value);
                    break;
                case 'log':
                    if (value <= 0) throw new Error('Invalid input');
                    result = Math.log10(value);
                    break;
                case 'ln':
                    if (value <= 0) throw new Error('Invalid input');
                    result = Math.log(value);
                    break;
                case '10x':
                    result = Math.pow(10, value);
                    break;
                case 'ex':
                    result = Math.exp(value);
                    break;
                case 'x2':
                    result = Math.pow(value, 2);
                    break;
                case 'x3':
                    result = Math.pow(value, 3);
                    break;
                case 'sqrt':
                    if (value < 0) throw new Error('Invalid input');
                    result = Math.sqrt(value);
                    break;
                case 'cbrt':
                    result = Math.cbrt(value);
                    break;
                case 'abs':
                    result = Math.abs(value);
                    break;
                case 'factorial':
                    if (value < 0 || !Number.isInteger(value)) throw new Error('Invalid input');
                    result = this.factorial(value);
                    break;
                case 'inverse':
                    if (value === 0) throw new Error('Division by zero');
                    result = 1 / value;
                    break;
            }
            
            this.currentValue = this.formatNumber(result);
            this.waitingForOperand = true;
            this.updateDisplay();
        } catch (e) {
            this.showError(e.message);
        }
    }
    
    factorial(n) {
        if (n === 0 || n === 1) return 1;
        if (n > 170) throw new Error('Overflow');
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }
    
    insertConstant(value) {
        this.currentValue = this.formatNumber(value);
        this.waitingForOperand = true;
        this.updateDisplay();
    }
    
    inputDecimal() {
        if (this.waitingForOperand) {
            this.currentValue = '0.';
            this.waitingForOperand = false;
        } else if (!this.currentValue.includes('.')) {
            this.currentValue += '.';
        }
        this.updateDisplay();
    }
    
    inputParenthesis(paren) {
        // Simplified: just append to expression for prototype
        this.expressionDisplay.textContent += paren;
    }
    
    negate() {
        const value = parseFloat(this.currentValue);
        this.currentValue = this.formatNumber(-value);
        this.updateDisplay();
    }
    
    percent() {
        const value = parseFloat(this.currentValue);
        this.currentValue = this.formatNumber(value / 100);
        this.updateDisplay();
    }
    
    clear() {
        this.currentValue = '0';
        this.previousValue = '';
        this.operator = null;
        this.waitingForOperand = false;
        this.updateDisplay();
        this.expressionDisplay.textContent = '';
    }
    
    // Memory functions
    memoryClear() {
        this.memory = 0;
        this.hasMemory = false;
        this.updateMemoryIndicator();
    }
    
    memoryRecall() {
        if (this.hasMemory) {
            this.currentValue = this.formatNumber(this.memory);
            this.waitingForOperand = true;
            this.updateDisplay();
        }
    }
    
    memoryAdd() {
        this.memory += parseFloat(this.currentValue);
        this.hasMemory = true;
        this.updateMemoryIndicator();
    }
    
    memorySubtract() {
        this.memory -= parseFloat(this.currentValue);
        this.hasMemory = true;
        this.updateMemoryIndicator();
    }
    
    memoryStore() {
        this.memory = parseFloat(this.currentValue);
        this.hasMemory = true;
        this.updateMemoryIndicator();
    }
    
    updateMemoryIndicator() {
        this.memoryIndicator.classList.toggle('active', this.hasMemory);
    }
    
    // History functions
    addToHistory(expression, result) {
        this.history.unshift({ expression, result: this.formatNumber(result) });
        if (this.history.length > 50) this.history.pop();
        this.renderHistory();
    }
    
    renderHistory() {
        if (this.history.length === 0) {
            this.historyList.innerHTML = '<div class="history-empty">История пуста</div>';
            return;
        }
        
        this.historyList.innerHTML = this.history.map((item, index) => `
            <div class="history-item" data-index="${index}">
                <div class="history-expression">${item.expression} =</div>
                <div class="history-result">${item.result}</div>
            </div>
        `).join('');
        
        // Add click handlers to history items
        this.historyList.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                this.currentValue = this.history[index].result;
                this.updateDisplay();
                this.toggleHistory();
            });
        });
    }
    
    clearHistory() {
        this.history = [];
        this.renderHistory();
    }
    
    // Display updates
    updateDisplay() {
        this.resultDisplay.textContent = this.currentValue;
    }
    
    updateExpression() {
        if (this.operator) {
            this.expressionDisplay.textContent = `${this.previousValue} ${this.operator}`;
        } else {
            this.expressionDisplay.textContent = '';
        }
    }
    
    formatNumber(num) {
        if (isNaN(num) || !isFinite(num)) {
            return 'Error';
        }
        
        // Use scientific notation for very large or small numbers
        if (Math.abs(num) > 1e15 || (Math.abs(num) < 1e-10 && num !== 0)) {
            return num.toExponential(10);
        }
        
        // Round to avoid floating point errors
        const rounded = parseFloat(num.toPrecision(15));
        return String(rounded);
    }
    
    showError(message) {
        this.resultDisplay.textContent = 'Error';
        this.calculator.querySelector('.display').classList.add('error');
        
        setTimeout(() => {
            this.calculator.querySelector('.display').classList.remove('error');
            this.clear();
        }, 1500);
    }
    
    // Keyboard support
    handleKeyboard(e) {
        const key = e.key;
        
        if (/[0-9]/.test(key)) {
            this.inputDigit(key);
        } else if (key === '.') {
            this.inputDecimal();
        } else if (key === '+') {
            this.handleOperator('+');
        } else if (key === '-') {
            this.handleOperator('-');
        } else if (key === '*') {
            this.handleOperator('×');
        } else if (key === '/') {
            e.preventDefault();
            this.handleOperator('÷');
        } else if (key === 'Enter' || key === '=') {
            this.calculate();
        } else if (key === 'Escape' || key === 'c' || key === 'C') {
            this.clear();
        } else if (key === 'Backspace') {
            this.backspace();
        } else if (key === '%') {
            this.percent();
        }
    }
    
    backspace() {
        if (this.currentValue.length > 1) {
            this.currentValue = this.currentValue.slice(0, -1);
        } else {
            this.currentValue = '0';
        }
        this.updateDisplay();
    }
}

// Initialize calculator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Load saved theme
    const savedTheme = localStorage.getItem('calculator-theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    
    // Initialize calculator
    window.calculator = new Calculator();
});
