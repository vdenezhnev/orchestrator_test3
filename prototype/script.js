/**
 * Engineering Calculator - Legacy version (ES5 compatible)
 * Fallback for browsers without ES6 module support
 * 
 * This file provides the same functionality as the modular version
 * but in a single file without ES6 imports/exports.
 */

var Calculator = (function() {
    'use strict';
    
    function Calculator() {
        this.currentValue = '0';
        this.previousValue = '';
        this.operator = null;
        this.waitingForOperand = false;
        this.memory = 0;
        this.hasMemory = false;
        this.isDegreeMode = true;
        this.isSecondMode = false;
        this.history = [];
        this.maxHistoryLength = 50;
        this.storageKey = 'calculator-state';
        
        this.init();
    }
    
    Calculator.prototype.init = function() {
        this.bindElements();
        this.bindEvents();
        this.loadTheme();
        this.loadState();
        this.updateDisplay();
        this.setupAutoSave();
    };
    
    Calculator.prototype.bindElements = function() {
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
    };
    
    Calculator.prototype.bindEvents = function() {
        var self = this;
        
        // Theme toggle
        this.themeToggle.addEventListener('click', function() {
            self.cycleTheme();
        });
        
        // History toggle
        this.historyToggle.addEventListener('click', function() {
            self.toggleHistory();
        });
        this.historyClear.addEventListener('click', function() {
            self.clearHistory();
        });
        
        // Second function toggle
        this.secondBtn.addEventListener('click', function() {
            self.toggleSecond();
        });
        
        // Mode buttons
        var modeBtns = document.querySelectorAll('.mode-selector__btn');
        for (var i = 0; i < modeBtns.length; i++) {
            modeBtns[i].addEventListener('click', function(e) {
                self.setMode(e.target.dataset.mode);
            });
        }
        
        // All calculator keys - using event delegation
        this.calculator.addEventListener('click', function(e) {
            var key = e.target.closest('.key');
            if (key) {
                self.handleKey(key);
            }
        });
        
        // Keyboard events
        document.addEventListener('keydown', function(e) {
            self.handleKeyboard(e);
        });
        
        // Close history on background click
        this.historyPanel.addEventListener('click', function(e) {
            if (e.target === self.historyPanel) {
                self.toggleHistory();
            }
        });
        
        // Touch events for long press
        this.setupTouchEvents();
        
        // Save state before unload
        window.addEventListener('beforeunload', function() {
            self.saveState();
        });
    };
    
    Calculator.prototype.setupTouchEvents = function() {
        var self = this;
        var longPressTimer = null;
        var longPressDelay = 500;
        
        this.calculator.addEventListener('touchstart', function(e) {
            var target = e.target.closest('.key');
            if (target && target.dataset.action === 'backspace') {
                longPressTimer = setTimeout(function() {
                    self.clear();
                    self.showFeedback('Очищено');
                }, longPressDelay);
            }
        }, { passive: true });
        
        this.calculator.addEventListener('touchend', function() {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        }, { passive: true });
        
        this.calculator.addEventListener('touchmove', function() {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        }, { passive: true });
    };
    
    Calculator.prototype.setupAutoSave = function() {
        var self = this;
        setInterval(function() {
            self.saveState();
        }, 30000);
    };
    
    Calculator.prototype.saveState = function() {
        try {
            var state = {
                currentValue: this.currentValue,
                previousValue: this.previousValue,
                operator: this.operator,
                memory: this.memory,
                hasMemory: this.hasMemory,
                isDegreeMode: this.isDegreeMode,
                history: this.history
            };
            localStorage.setItem(this.storageKey, JSON.stringify(state));
        } catch (e) {
            console.warn('Failed to save calculator state:', e);
        }
    };
    
    Calculator.prototype.loadState = function() {
        try {
            var savedState = localStorage.getItem(this.storageKey);
            if (savedState) {
                var state = JSON.parse(savedState);
                this.currentValue = state.currentValue || '0';
                this.previousValue = state.previousValue || '';
                this.operator = state.operator || null;
                this.memory = state.memory || 0;
                this.hasMemory = state.hasMemory || false;
                this.isDegreeMode = state.isDegreeMode !== false;
                this.history = state.history || [];
            }
        } catch (e) {
            console.warn('Failed to load calculator state:', e);
        }
    };
    
    Calculator.prototype.loadTheme = function() {
        var savedTheme = localStorage.getItem('calculator-theme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
        this.updateThemeToggle(savedTheme);
    };
    
    Calculator.prototype.cycleTheme = function() {
        var themes = ['light', 'dark', 'high-contrast'];
        var currentTheme = document.body.getAttribute('data-theme') || 'light';
        var currentIndex = themes.indexOf(currentTheme);
        var nextTheme = themes[(currentIndex + 1) % themes.length];
        
        document.body.setAttribute('data-theme', nextTheme);
        localStorage.setItem('calculator-theme', nextTheme);
        this.updateThemeToggle(nextTheme);
        this.announceForScreenReader('Тема: ' + this.getThemeName(nextTheme));
    };
    
    Calculator.prototype.getThemeName = function(theme) {
        var names = { 'light': 'светлая', 'dark': 'тёмная', 'high-contrast': 'высокий контраст' };
        return names[theme] || theme;
    };
    
    Calculator.prototype.updateThemeToggle = function(theme) {
        var isDark = theme === 'dark' || theme === 'high-contrast';
        this.themeToggle.setAttribute('aria-pressed', isDark);
        this.themeToggle.setAttribute('aria-label', 
            'Текущая тема: ' + this.getThemeName(theme) + '. Нажмите для переключения.'
        );
    };
    
    Calculator.prototype.toggleHistory = function() {
        var isOpen = this.historyPanel.classList.toggle('active');
        this.historyPanel.setAttribute('aria-hidden', !isOpen);
        this.historyToggle.setAttribute('aria-expanded', isOpen);
        
        if (isOpen) {
            this.renderHistory();
            var firstItem = this.historyPanel.querySelector('.history-panel__item');
            if (firstItem) {
                firstItem.focus();
            }
        }
    };
    
    Calculator.prototype.toggleSecond = function() {
        this.isSecondMode = !this.isSecondMode;
        this.secondBtn.classList.toggle('active', this.isSecondMode);
        this.secondBtn.setAttribute('aria-pressed', this.isSecondMode);
    };
    
    Calculator.prototype.setMode = function(mode) {
        this.isDegreeMode = mode === 'deg';
        this.modeIndicator.textContent = mode.toUpperCase();
        
        var modeBtns = document.querySelectorAll('.mode-selector__btn');
        for (var i = 0; i < modeBtns.length; i++) {
            var btn = modeBtns[i];
            var isActive = btn.dataset.mode === mode;
            btn.classList.toggle('mode-selector__btn--active', isActive);
            btn.setAttribute('aria-checked', isActive);
        }
        
        this.announceForScreenReader(mode === 'deg' ? 'Режим градусы' : 'Режим радианы');
    };
    
    Calculator.prototype.handleKey = function(key) {
        var self = this;
        key.classList.add('pressed');
        setTimeout(function() {
            key.classList.remove('pressed');
        }, 100);
        
        if (key.dataset.digit !== undefined) {
            this.inputDigit(key.dataset.digit);
        } else if (key.dataset.action) {
            this.handleAction(key.dataset.action);
        }
    };
    
    Calculator.prototype.inputDigit = function(digit) {
        if (this.waitingForOperand) {
            this.currentValue = digit;
            this.waitingForOperand = false;
        } else {
            if (this.currentValue === '0' && digit !== '0') {
                this.currentValue = digit;
            } else if (this.currentValue !== '0' || digit !== '0') {
                if (this.currentValue.replace(/[^0-9]/g, '').length < 15) {
                    this.currentValue = this.currentValue + digit;
                }
            }
        }
        this.updateDisplay();
    };
    
    Calculator.prototype.handleAction = function(action) {
        var self = this;
        var actions = {
            'add': function() { self.handleOperator('+'); },
            'subtract': function() { self.handleOperator('-'); },
            'multiply': function() { self.handleOperator('×'); },
            'divide': function() { self.handleOperator('÷'); },
            'equals': function() { self.calculate(); },
            'clear': function() { self.clear(); },
            'decimal': function() { self.inputDecimal(); },
            'negate': function() { self.negate(); },
            'percent': function() { self.percent(); },
            'mc': function() { self.memoryClear(); },
            'mr': function() { self.memoryRecall(); },
            'm-plus': function() { self.memoryAdd(); },
            'm-minus': function() { self.memorySubtract(); },
            'ms': function() { self.memoryStore(); },
            'sin': function() { self.applyFunction('sin'); },
            'cos': function() { self.applyFunction('cos'); },
            'tan': function() { self.applyFunction('tan'); },
            'asin': function() { self.applyFunction('asin'); },
            'acos': function() { self.applyFunction('acos'); },
            'atan': function() { self.applyFunction('atan'); },
            'log': function() { self.applyFunction('log'); },
            'ln': function() { self.applyFunction('ln'); },
            '10x': function() { self.applyFunction('10x'); },
            'ex': function() { self.applyFunction('ex'); },
            'x2': function() { self.applyFunction('x2'); },
            'x3': function() { self.applyFunction('x3'); },
            'sqrt': function() { self.applyFunction('sqrt'); },
            'cbrt': function() { self.applyFunction('cbrt'); },
            'abs': function() { self.applyFunction('abs'); },
            'factorial': function() { self.applyFunction('factorial'); },
            'inverse': function() { self.applyFunction('inverse'); },
            'pi': function() { self.insertConstant(Math.PI); },
            'e': function() { self.insertConstant(Math.E); },
            'lparen': function() { self.inputParenthesis('('); },
            'rparen': function() { self.inputParenthesis(')'); }
        };
        
        var actionFn = actions[action];
        if (actionFn) actionFn();
    };
    
    Calculator.prototype.handleOperator = function(op) {
        if (this.operator && !this.waitingForOperand) {
            this.calculate();
        }
        
        this.previousValue = this.currentValue;
        this.operator = op;
        this.waitingForOperand = true;
        this.updateExpression();
        this.highlightActiveOperator(op);
        this.announceForScreenReader(this.getOperatorName(op));
    };
    
    Calculator.prototype.getOperatorName = function(op) {
        var names = { '+': 'плюс', '-': 'минус', '×': 'умножить', '÷': 'разделить' };
        return names[op] || op;
    };
    
    Calculator.prototype.highlightActiveOperator = function(op) {
        var keys = document.querySelectorAll('.key--operator');
        for (var i = 0; i < keys.length; i++) {
            keys[i].classList.remove('active');
            keys[i].setAttribute('aria-pressed', 'false');
        }
        
        var opMap = { '+': 'add', '-': 'subtract', '×': 'multiply', '÷': 'divide' };
        var activeKey = document.querySelector('[data-action="' + opMap[op] + '"]');
        if (activeKey) {
            activeKey.classList.add('active');
            activeKey.setAttribute('aria-pressed', 'true');
        }
    };
    
    Calculator.prototype.clearOperatorHighlight = function() {
        var keys = document.querySelectorAll('.key--operator');
        for (var i = 0; i < keys.length; i++) {
            keys[i].classList.remove('active');
            keys[i].setAttribute('aria-pressed', 'false');
        }
    };
    
    Calculator.prototype.calculate = function() {
        if (!this.operator || this.waitingForOperand) return;
        
        var prev = parseFloat(this.previousValue);
        var current = parseFloat(this.currentValue);
        var result;
        
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
        
        var expression = this.previousValue + ' ' + this.operator + ' ' + this.currentValue;
        this.addToHistory(expression, result);
        
        this.currentValue = this.formatNumber(result);
        this.operator = null;
        this.previousValue = '';
        this.waitingForOperand = true;
        this.clearOperatorHighlight();
        this.updateDisplay();
        this.updateExpression();
        this.announceForScreenReader('Результат: ' + this.currentValue);
    };
    
    Calculator.prototype.applyFunction = function(func) {
        var value = parseFloat(this.currentValue);
        var result;
        
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
    };
    
    Calculator.prototype.factorial = function(n) {
        if (n === 0 || n === 1) return 1;
        if (n > 170) throw new Error('Переполнение');
        var result = 1;
        for (var i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    };
    
    Calculator.prototype.insertConstant = function(value) {
        this.currentValue = this.formatNumber(value);
        this.waitingForOperand = true;
        this.updateDisplay();
    };
    
    Calculator.prototype.inputDecimal = function() {
        if (this.waitingForOperand) {
            this.currentValue = '0.';
            this.waitingForOperand = false;
        } else if (this.currentValue.indexOf('.') === -1) {
            this.currentValue += '.';
        }
        this.updateDisplay();
    };
    
    Calculator.prototype.inputParenthesis = function(paren) {
        this.expressionDisplay.textContent += paren;
    };
    
    Calculator.prototype.negate = function() {
        var value = parseFloat(this.currentValue);
        this.currentValue = this.formatNumber(-value);
        this.updateDisplay();
    };
    
    Calculator.prototype.percent = function() {
        var value = parseFloat(this.currentValue);
        
        if (this.previousValue && this.operator) {
            var prev = parseFloat(this.previousValue);
            this.currentValue = this.formatNumber(prev * value / 100);
        } else {
            this.currentValue = this.formatNumber(value / 100);
        }
        
        this.updateDisplay();
    };
    
    Calculator.prototype.clear = function() {
        this.currentValue = '0';
        this.previousValue = '';
        this.operator = null;
        this.waitingForOperand = false;
        this.clearOperatorHighlight();
        this.updateDisplay();
        this.expressionDisplay.textContent = '';
        this.announceForScreenReader('Очищено');
    };
    
    Calculator.prototype.memoryClear = function() {
        this.memory = 0;
        this.hasMemory = false;
        this.updateMemoryIndicator();
        this.announceForScreenReader('Память очищена');
    };
    
    Calculator.prototype.memoryRecall = function() {
        if (this.hasMemory) {
            this.currentValue = this.formatNumber(this.memory);
            this.waitingForOperand = true;
            this.updateDisplay();
            this.announceForScreenReader('Из памяти: ' + this.currentValue);
        }
    };
    
    Calculator.prototype.memoryAdd = function() {
        this.memory += parseFloat(this.currentValue);
        this.hasMemory = true;
        this.updateMemoryIndicator();
        this.announceForScreenReader('Добавлено в память');
    };
    
    Calculator.prototype.memorySubtract = function() {
        this.memory -= parseFloat(this.currentValue);
        this.hasMemory = true;
        this.updateMemoryIndicator();
        this.announceForScreenReader('Вычтено из памяти');
    };
    
    Calculator.prototype.memoryStore = function() {
        this.memory = parseFloat(this.currentValue);
        this.hasMemory = true;
        this.updateMemoryIndicator();
        this.announceForScreenReader('Сохранено в память');
    };
    
    Calculator.prototype.updateMemoryIndicator = function() {
        this.memoryIndicator.classList.toggle('active', this.hasMemory);
        this.memoryIndicator.setAttribute('aria-hidden', !this.hasMemory);
    };
    
    Calculator.prototype.addToHistory = function(expression, result) {
        this.history.unshift({ 
            expression: expression, 
            result: this.formatNumber(result),
            timestamp: Date.now()
        });
        if (this.history.length > this.maxHistoryLength) this.history.pop();
    };
    
    Calculator.prototype.renderHistory = function() {
        var self = this;
        
        if (this.history.length === 0) {
            this.historyList.innerHTML = '<li class="history-panel__empty">История пуста</li>';
            return;
        }
        
        var html = '';
        for (var i = 0; i < this.history.length; i++) {
            var item = this.history[i];
            html += '<li class="history-panel__item" tabindex="0" data-index="' + i + '" role="button" aria-label="' + 
                    this.escapeHtml(item.expression) + ' равно ' + this.escapeHtml(item.result) + '">' +
                    '<div class="history-panel__expression">' + this.escapeHtml(item.expression) + ' =</div>' +
                    '<div class="history-panel__result">' + this.escapeHtml(item.result) + '</div>' +
                    '</li>';
        }
        this.historyList.innerHTML = html;
        
        var items = this.historyList.querySelectorAll('.history-panel__item');
        for (var j = 0; j < items.length; j++) {
            (function(item) {
                item.addEventListener('click', function() {
                    self.selectHistoryItem(item);
                });
                item.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        self.selectHistoryItem(item);
                    }
                });
            })(items[j]);
        }
    };
    
    Calculator.prototype.selectHistoryItem = function(item) {
        var index = parseInt(item.dataset.index);
        this.currentValue = this.history[index].result;
        this.waitingForOperand = true;
        this.updateDisplay();
        this.toggleHistory();
    };
    
    Calculator.prototype.escapeHtml = function(text) {
        var div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    };
    
    Calculator.prototype.clearHistory = function() {
        this.history = [];
        this.renderHistory();
        this.announceForScreenReader('История очищена');
    };
    
    Calculator.prototype.updateDisplay = function() {
        var formattedValue = this.formatDisplayValue(this.currentValue);
        this.resultDisplay.textContent = formattedValue;
        this.display.classList.remove('display--error');
        this.adjustFontSize();
    };
    
    Calculator.prototype.formatDisplayValue = function(value) {
        if (!value || value === 'Ошибка' || value.indexOf('e') !== -1 || value.indexOf('∞') !== -1) {
            return value;
        }
        
        var parts = value.split('.');
        var integerPart = parts[0];
        var decimalPart = parts[1];
        
        if (integerPart.length > 3 && integerPart.indexOf(' ') === -1) {
            var formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
            return decimalPart !== undefined ? formatted + '.' + decimalPart : formatted;
        }
        
        return value;
    };
    
    Calculator.prototype.adjustFontSize = function() {
        var length = this.currentValue.length;
        var fontSize;
        
        if (length <= 8) {
            fontSize = '';
        } else if (length <= 12) {
            fontSize = 'clamp(1.5rem, 6vw, 2.5rem)';
        } else if (length <= 16) {
            fontSize = 'clamp(1.2rem, 5vw, 2rem)';
        } else {
            fontSize = 'clamp(1rem, 4vw, 1.5rem)';
        }
        
        this.resultDisplay.style.fontSize = fontSize;
    };
    
    Calculator.prototype.updateExpression = function() {
        if (this.operator) {
            this.expressionDisplay.textContent = this.previousValue + ' ' + this.operator;
        } else {
            this.expressionDisplay.textContent = '';
        }
    };
    
    Calculator.prototype.formatNumber = function(num) {
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
        
        var rounded = parseFloat(num.toPrecision(15));
        return String(rounded);
    };
    
    Calculator.prototype.showError = function(message) {
        var self = this;
        this.resultDisplay.textContent = message;
        this.display.classList.add('display--error');
        this.display.classList.add('shake');
        
        this.announceForScreenReader('Ошибка: ' + message);
        
        setTimeout(function() {
            self.display.classList.remove('shake');
        }, 300);
        
        setTimeout(function() {
            self.clear();
        }, 2000);
    };
    
    Calculator.prototype.showFeedback = function(message) {
        var feedback = document.createElement('div');
        feedback.className = 'feedback-toast';
        feedback.textContent = message;
        feedback.setAttribute('role', 'status');
        
        this.calculator.appendChild(feedback);
        
        requestAnimationFrame(function() {
            feedback.classList.add('visible');
        });
        
        setTimeout(function() {
            feedback.classList.remove('visible');
            setTimeout(function() {
                feedback.remove();
            }, 300);
        }, 1000);
    };
    
    Calculator.prototype.handleKeyboard = function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        var historyOpen = this.historyPanel.classList.contains('active');
        if (historyOpen) {
            if (e.key === 'Escape') {
                this.toggleHistory();
                return;
            }
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                this.navigateHistory(e.key);
                e.preventDefault();
                return;
            }
        }
        
        var key = e.key;
        
        if (/[0-9]/.test(key)) {
            this.inputDigit(key);
            this.animateKey('[data-digit="' + key + '"]');
        } else if (key === '.' || key === ',') {
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
        } else if (key === 'Escape' || key === 'Delete') {
            this.clear();
            this.animateKey('[data-action="clear"]');
        } else if (key === 'Backspace') {
            this.backspace();
        } else if (key === '%') {
            this.percent();
            this.animateKey('[data-action="percent"]');
        }
    };
    
    Calculator.prototype.navigateHistory = function(direction) {
        var items = this.historyList.querySelectorAll('.history-panel__item');
        if (items.length === 0) return;
        
        var focusedItem = document.activeElement.closest('.history-panel__item');
        if (!focusedItem) {
            items[0].focus();
            return;
        }
        
        var currentIndex = Array.prototype.indexOf.call(items, focusedItem);
        var nextIndex;
        
        if (direction === 'ArrowUp') {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        } else {
            nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        }
        
        items[nextIndex].focus();
    };
    
    Calculator.prototype.animateKey = function(selector) {
        var key = document.querySelector(selector);
        if (key) {
            key.classList.add('pressed');
            setTimeout(function() {
                key.classList.remove('pressed');
            }, 100);
        }
    };
    
    Calculator.prototype.backspace = function() {
        if (this.waitingForOperand) return;
        
        if (this.currentValue.length > 1) {
            this.currentValue = this.currentValue.slice(0, -1);
            if (this.currentValue === '-') {
                this.currentValue = '0';
            }
        } else {
            this.currentValue = '0';
        }
        this.updateDisplay();
    };
    
    Calculator.prototype.announceForScreenReader = function(message) {
        var announcer = document.getElementById('sr-announcer');
        if (!announcer) {
            announcer = document.createElement('div');
            announcer.id = 'sr-announcer';
            announcer.setAttribute('role', 'status');
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            announcer.className = 'visually-hidden';
            document.body.appendChild(announcer);
        }
        announcer.textContent = message;
    };
    
    return Calculator;
})();

document.addEventListener('DOMContentLoaded', () => {
    window.calculator = new Calculator();
});
