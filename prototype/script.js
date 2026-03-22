/**
 * Engineering Calculator
 * Semantic markup with accessible keyboard navigation
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
        this.loadTheme();
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
        this.display = this.calculator.querySelector('.display');
    }
    
    bindEvents() {
        this.themeToggle.addEventListener('click', () => this.cycleTheme());
        
        this.historyToggle.addEventListener('click', () => this.toggleHistory());
        this.historyClear.addEventListener('click', () => this.clearHistory());
        
        this.secondBtn.addEventListener('click', () => this.toggleSecond());
        
        document.querySelectorAll('.mode-selector__btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setMode(e.target.dataset.mode));
        });
        
        document.querySelectorAll('.key').forEach(key => {
            key.addEventListener('click', (e) => this.handleKey(e.currentTarget));
        });
        
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        this.historyPanel.addEventListener('click', (e) => {
            if (e.target === this.historyPanel) {
                this.toggleHistory();
            }
        });
    }
    
    loadTheme() {
        const savedTheme = localStorage.getItem('calculator-theme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
        this.updateThemeToggle(savedTheme);
    }
    
    cycleTheme() {
        const themes = ['light', 'dark', 'high-contrast'];
        const currentTheme = document.body.getAttribute('data-theme') || 'light';
        const currentIndex = themes.indexOf(currentTheme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];
        
        document.body.setAttribute('data-theme', nextTheme);
        localStorage.setItem('calculator-theme', nextTheme);
        this.updateThemeToggle(nextTheme);
    }
    
    updateThemeToggle(theme) {
        const isDark = theme === 'dark' || theme === 'high-contrast';
        this.themeToggle.setAttribute('aria-pressed', isDark);
        this.themeToggle.setAttribute('aria-label', 
            `Текущая тема: ${theme === 'light' ? 'светлая' : theme === 'dark' ? 'тёмная' : 'высокий контраст'}. Нажмите для переключения.`
        );
    }
    
    toggleHistory() {
        const isOpen = this.historyPanel.classList.toggle('active');
        this.historyPanel.setAttribute('aria-hidden', !isOpen);
        this.historyToggle.setAttribute('aria-expanded', isOpen);
        
        if (isOpen) {
            this.historyPanel.focus();
        }
    }
    
    toggleSecond() {
        this.isSecondMode = !this.isSecondMode;
        this.secondBtn.classList.toggle('active', this.isSecondMode);
        this.secondBtn.setAttribute('aria-pressed', this.isSecondMode);
    }
    
    setMode(mode) {
        this.isDegreeMode = mode === 'deg';
        this.modeIndicator.textContent = mode.toUpperCase();
        
        document.querySelectorAll('.mode-selector__btn').forEach(btn => {
            const isActive = btn.dataset.mode === mode;
            btn.classList.toggle('mode-selector__btn--active', isActive);
            btn.setAttribute('aria-checked', isActive);
        });
    }
    
    handleKey(key) {
        key.classList.add('pressed');
        setTimeout(() => key.classList.remove('pressed'), 100);
        
        if (key.dataset.digit !== undefined) {
            this.inputDigit(key.dataset.digit);
        } else if (key.dataset.action) {
            this.handleAction(key.dataset.action);
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
        const actions = {
            'add': () => this.handleOperator('+'),
            'subtract': () => this.handleOperator('-'),
            'multiply': () => this.handleOperator('×'),
            'divide': () => this.handleOperator('÷'),
            'equals': () => this.calculate(),
            'clear': () => this.clear(),
            'decimal': () => this.inputDecimal(),
            'negate': () => this.negate(),
            'percent': () => this.percent(),
            'mc': () => this.memoryClear(),
            'mr': () => this.memoryRecall(),
            'm-plus': () => this.memoryAdd(),
            'm-minus': () => this.memorySubtract(),
            'ms': () => this.memoryStore(),
            'sin': () => this.applyFunction('sin'),
            'cos': () => this.applyFunction('cos'),
            'tan': () => this.applyFunction('tan'),
            'asin': () => this.applyFunction('asin'),
            'acos': () => this.applyFunction('acos'),
            'atan': () => this.applyFunction('atan'),
            'log': () => this.applyFunction('log'),
            'ln': () => this.applyFunction('ln'),
            '10x': () => this.applyFunction('10x'),
            'ex': () => this.applyFunction('ex'),
            'x2': () => this.applyFunction('x2'),
            'x3': () => this.applyFunction('x3'),
            'sqrt': () => this.applyFunction('sqrt'),
            'cbrt': () => this.applyFunction('cbrt'),
            'abs': () => this.applyFunction('abs'),
            'factorial': () => this.applyFunction('factorial'),
            'inverse': () => this.applyFunction('inverse'),
            'pi': () => this.insertConstant(Math.PI),
            'e': () => this.insertConstant(Math.E),
            'lparen': () => this.inputParenthesis('('),
            'rparen': () => this.inputParenthesis(')'),
        };
        
        const actionFn = actions[action];
        if (actionFn) actionFn();
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
        this.highlightActiveOperator(op);
    }
    
    highlightActiveOperator(op) {
        document.querySelectorAll('.key--operator').forEach(key => {
            key.classList.remove('active');
        });
        
        const opMap = { '+': 'add', '-': 'subtract', '×': 'multiply', '÷': 'divide' };
        const activeKey = document.querySelector(`[data-action="${opMap[op]}"]`);
        if (activeKey) activeKey.classList.add('active');
    }
    
    clearOperatorHighlight() {
        document.querySelectorAll('.key--operator').forEach(key => {
            key.classList.remove('active');
        });
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
                    this.showError('Деление на ноль');
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
        this.clearOperatorHighlight();
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
                    if (value < -1 || value > 1) throw new Error('Недопустимое значение');
                    result = this.isDegreeMode ? Math.asin(value) * 180 / Math.PI : Math.asin(value);
                    break;
                case 'acos':
                    if (value < -1 || value > 1) throw new Error('Недопустимое значение');
                    result = this.isDegreeMode ? Math.acos(value) * 180 / Math.PI : Math.acos(value);
                    break;
                case 'atan':
                    result = this.isDegreeMode ? Math.atan(value) * 180 / Math.PI : Math.atan(value);
                    break;
                case 'log':
                    if (value <= 0) throw new Error('Недопустимое значение');
                    result = Math.log10(value);
                    break;
                case 'ln':
                    if (value <= 0) throw new Error('Недопустимое значение');
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
                    if (value < 0) throw new Error('Недопустимое значение');
                    result = Math.sqrt(value);
                    break;
                case 'cbrt':
                    result = Math.cbrt(value);
                    break;
                case 'abs':
                    result = Math.abs(value);
                    break;
                case 'factorial':
                    if (value < 0 || !Number.isInteger(value)) throw new Error('Недопустимое значение');
                    result = this.factorial(value);
                    break;
                case 'inverse':
                    if (value === 0) throw new Error('Деление на ноль');
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
        if (n > 170) throw new Error('Переполнение');
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
        this.clearOperatorHighlight();
        this.updateDisplay();
        this.expressionDisplay.textContent = '';
    }
    
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
    
    addToHistory(expression, result) {
        this.history.unshift({ expression, result: this.formatNumber(result) });
        if (this.history.length > 50) this.history.pop();
        this.renderHistory();
    }
    
    renderHistory() {
        if (this.history.length === 0) {
            this.historyList.innerHTML = '<li class="history-panel__empty">История пуста</li>';
            return;
        }
        
        this.historyList.innerHTML = this.history.map((item, index) => `
            <li class="history-panel__item" tabindex="0" data-index="${index}" role="button">
                <div class="history-panel__expression">${this.escapeHtml(item.expression)} =</div>
                <div class="history-panel__result">${this.escapeHtml(item.result)}</div>
            </li>
        `).join('');
        
        this.historyList.querySelectorAll('.history-panel__item').forEach(item => {
            item.addEventListener('click', () => this.selectHistoryItem(item));
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.selectHistoryItem(item);
                }
            });
        });
    }
    
    selectHistoryItem(item) {
        const index = parseInt(item.dataset.index);
        this.currentValue = this.history[index].result;
        this.updateDisplay();
        this.toggleHistory();
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    clearHistory() {
        this.history = [];
        this.renderHistory();
    }
    
    updateDisplay() {
        this.resultDisplay.textContent = this.currentValue;
        this.display.classList.remove('display--error');
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
            return 'Ошибка';
        }
        
        if (Math.abs(num) > 1e15 || (Math.abs(num) < 1e-10 && num !== 0)) {
            return num.toExponential(10);
        }
        
        const rounded = parseFloat(num.toPrecision(15));
        return String(rounded);
    }
    
    showError(message) {
        this.resultDisplay.textContent = message;
        this.display.classList.add('display--error');
        
        this.resultDisplay.setAttribute('aria-live', 'assertive');
        
        setTimeout(() => {
            this.resultDisplay.setAttribute('aria-live', 'polite');
            this.clear();
        }, 1500);
    }
    
    handleKeyboard(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        const key = e.key;
        
        if (/[0-9]/.test(key)) {
            this.inputDigit(key);
            this.animateKey(`[data-digit="${key}"]`);
        } else if (key === '.') {
            this.inputDecimal();
            this.animateKey('[data-action="decimal"]');
        } else if (key === '+') {
            this.handleOperator('+');
            this.animateKey('[data-action="add"]');
        } else if (key === '-') {
            this.handleOperator('-');
            this.animateKey('[data-action="subtract"]');
        } else if (key === '*') {
            this.handleOperator('×');
            this.animateKey('[data-action="multiply"]');
        } else if (key === '/') {
            e.preventDefault();
            this.handleOperator('÷');
            this.animateKey('[data-action="divide"]');
        } else if (key === 'Enter' || key === '=') {
            e.preventDefault();
            this.calculate();
            this.animateKey('[data-action="equals"]');
        } else if (key === 'Escape') {
            this.clear();
            this.animateKey('[data-action="clear"]');
        } else if (key === 'Backspace') {
            this.backspace();
        } else if (key === '%') {
            this.percent();
            this.animateKey('[data-action="percent"]');
        }
    }
    
    animateKey(selector) {
        const key = document.querySelector(selector);
        if (key) {
            key.classList.add('pressed');
            setTimeout(() => key.classList.remove('pressed'), 100);
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

document.addEventListener('DOMContentLoaded', () => {
    window.calculator = new Calculator();
});
