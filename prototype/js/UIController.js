/**
 * UIController - Handles all user interactions (clicks, keyboard events)
 * Implements the Controller part of MVC pattern
 */

class UIController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        
        this.keyboardMap = this.createKeyboardMap();
        this.touchStartTime = 0;
        this.longPressTimer = null;
        this.longPressDelay = 500;
        
        this.init();
    }
    
    init() {
        this.bindClickEvents();
        this.bindKeyboardEvents();
        this.bindTouchEvents();
        this.bindFocusEvents();
    }
    
    /**
     * Create mapping from keyboard keys to calculator actions
     */
    createKeyboardMap() {
        return {
            '0': { type: 'digit', value: '0' },
            '1': { type: 'digit', value: '1' },
            '2': { type: 'digit', value: '2' },
            '3': { type: 'digit', value: '3' },
            '4': { type: 'digit', value: '4' },
            '5': { type: 'digit', value: '5' },
            '6': { type: 'digit', value: '6' },
            '7': { type: 'digit', value: '7' },
            '8': { type: 'digit', value: '8' },
            '9': { type: 'digit', value: '9' },
            '.': { type: 'action', value: 'decimal' },
            ',': { type: 'action', value: 'decimal' },
            '+': { type: 'operator', value: '+' },
            '-': { type: 'operator', value: '-' },
            '*': { type: 'operator', value: '×' },
            '/': { type: 'operator', value: '÷', preventDefault: true },
            'Enter': { type: 'action', value: 'equals', preventDefault: true },
            '=': { type: 'action', value: 'equals' },
            'Escape': { type: 'action', value: 'clear' },
            'Delete': { type: 'action', value: 'clear' },
            'Backspace': { type: 'action', value: 'backspace' },
            '%': { type: 'action', value: 'percent' },
            '(': { type: 'action', value: 'lparen' },
            ')': { type: 'action', value: 'rparen' },
            's': { type: 'function', value: 'sin' },
            'c': { type: 'function', value: 'cos' },
            't': { type: 'function', value: 'tan' },
            'l': { type: 'function', value: 'log' },
            'n': { type: 'function', value: 'ln' },
            'r': { type: 'function', value: 'sqrt' },
            'p': { type: 'constant', value: 'pi' },
            'e': { type: 'constant', value: 'e' },
            '!': { type: 'function', value: 'factorial' },
            '^': { type: 'action', value: 'xn' },
        };
    }
    
    /**
     * Bind click events to all interactive elements
     */
    bindClickEvents() {
        const calculator = document.getElementById('calculator');
        
        calculator.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action], [data-digit], [data-mode]');
            if (!target) return;
            
            this.handleElementClick(target, e);
        });
        
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.handleThemeToggle());
        }
        
        const historyToggle = document.getElementById('historyToggle');
        if (historyToggle) {
            historyToggle.addEventListener('click', () => this.handleHistoryToggle());
        }
        
        const historyClear = document.getElementById('historyClear');
        if (historyClear) {
            historyClear.addEventListener('click', () => this.handleHistoryClear());
        }
        
        const secondBtn = document.getElementById('secondBtn');
        if (secondBtn) {
            secondBtn.addEventListener('click', () => this.handleSecondToggle());
        }
        
        const historyPanel = document.getElementById('historyPanel');
        if (historyPanel) {
            historyPanel.addEventListener('click', (e) => {
                if (e.target === historyPanel) {
                    this.handleHistoryToggle();
                }
            });
        }
    }
    
    /**
     * Handle click on calculator element
     */
    handleElementClick(element, event) {
        this.view.animateKeyPress(element);
        
        if (element.dataset.digit !== undefined) {
            this.handleDigitInput(element.dataset.digit);
        } else if (element.dataset.action) {
            this.handleActionInput(element.dataset.action);
        } else if (element.dataset.mode) {
            this.handleModeChange(element.dataset.mode);
        }
    }
    
    /**
     * Bind keyboard events
     */
    bindKeyboardEvents() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }
    
    /**
     * Handle keydown event
     */
    handleKeyDown(event) {
        if (this.shouldIgnoreKeyboard(event)) return;
        
        const mapping = this.keyboardMap[event.key];
        if (!mapping) return;
        
        if (mapping.preventDefault) {
            event.preventDefault();
        }
        
        this.processKeyMapping(mapping, event);
        this.view.animateKeyBySelector(this.getKeySelector(mapping));
    }
    
    /**
     * Handle keyup event (for key repeat prevention if needed)
     */
    handleKeyUp(event) {
        // Reserved for future key repeat handling
    }
    
    /**
     * Check if keyboard input should be ignored
     */
    shouldIgnoreKeyboard(event) {
        const target = event.target;
        const tagName = target.tagName.toLowerCase();
        
        if (tagName === 'input' || tagName === 'textarea') {
            return true;
        }
        
        if (target.isContentEditable) {
            return true;
        }
        
        const historyPanel = document.getElementById('historyPanel');
        if (historyPanel && historyPanel.classList.contains('active')) {
            if (event.key === 'Escape') {
                this.handleHistoryToggle();
                return true;
            }
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                this.handleHistoryNavigation(event.key);
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Process keyboard mapping to action
     */
    processKeyMapping(mapping, event) {
        switch (mapping.type) {
            case 'digit':
                this.handleDigitInput(mapping.value);
                break;
            case 'operator':
                this.handleOperatorInput(mapping.value);
                break;
            case 'action':
                this.handleActionInput(mapping.value);
                break;
            case 'function':
                this.handleFunctionInput(mapping.value);
                break;
            case 'constant':
                this.handleConstantInput(mapping.value);
                break;
        }
    }
    
    /**
     * Get CSS selector for key animation
     */
    getKeySelector(mapping) {
        switch (mapping.type) {
            case 'digit':
                return `[data-digit="${mapping.value}"]`;
            case 'operator':
                const opMap = { '+': 'add', '-': 'subtract', '×': 'multiply', '÷': 'divide' };
                return `[data-action="${opMap[mapping.value]}"]`;
            case 'action':
            case 'function':
                return `[data-action="${mapping.value}"]`;
            default:
                return null;
        }
    }
    
    /**
     * Bind touch events for mobile support
     */
    bindTouchEvents() {
        const calculator = document.getElementById('calculator');
        
        calculator.addEventListener('touchstart', (e) => {
            this.touchStartTime = Date.now();
            const target = e.target.closest('.key');
            
            if (target) {
                this.longPressTimer = setTimeout(() => {
                    this.handleLongPress(target);
                }, this.longPressDelay);
            }
        }, { passive: true });
        
        calculator.addEventListener('touchend', () => {
            if (this.longPressTimer) {
                clearTimeout(this.longPressTimer);
                this.longPressTimer = null;
            }
        }, { passive: true });
        
        calculator.addEventListener('touchmove', () => {
            if (this.longPressTimer) {
                clearTimeout(this.longPressTimer);
                this.longPressTimer = null;
            }
        }, { passive: true });
    }
    
    /**
     * Handle long press on key (e.g., for backspace to clear all)
     */
    handleLongPress(target) {
        if (target.dataset.action === 'backspace') {
            this.handleActionInput('clear');
            this.view.showFeedback('Очищено');
        }
    }
    
    /**
     * Bind focus events for accessibility
     */
    bindFocusEvents() {
        const calculator = document.getElementById('calculator');
        
        calculator.addEventListener('focusin', (e) => {
            const key = e.target.closest('.key');
            if (key) {
                this.view.highlightKey(key);
            }
        });
        
        calculator.addEventListener('focusout', (e) => {
            const key = e.target.closest('.key');
            if (key) {
                this.view.unhighlightKey(key);
            }
        });
    }
    
    /**
     * Handle digit input
     */
    handleDigitInput(digit) {
        const result = this.model.inputDigit(digit);
        this.view.updateDisplay(this.model.getDisplayState());
        this.announceForScreenReader(digit);
    }
    
    /**
     * Handle operator input
     */
    handleOperatorInput(operator) {
        const result = this.model.inputOperator(operator);
        this.view.updateDisplay(this.model.getDisplayState());
        this.view.highlightActiveOperator(operator);
        this.announceForScreenReader(this.getOperatorName(operator));
    }
    
    /**
     * Handle action input (equals, clear, etc.)
     */
    handleActionInput(action) {
        const actionHandlers = {
            'equals': () => {
                const result = this.model.calculate();
                if (result.success) {
                    this.view.updateDisplay(this.model.getDisplayState());
                    this.view.clearOperatorHighlight();
                    this.view.updateHistory(this.model.getHistory());
                    this.announceForScreenReader(`Результат: ${result.value}`);
                } else {
                    this.view.showError(result.error);
                    this.announceForScreenReader(`Ошибка: ${result.error}`);
                }
            },
            'clear': () => {
                this.model.clear();
                this.view.updateDisplay(this.model.getDisplayState());
                this.view.clearOperatorHighlight();
                this.announceForScreenReader('Очищено');
            },
            'backspace': () => {
                this.model.backspace();
                this.view.updateDisplay(this.model.getDisplayState());
            },
            'decimal': () => {
                this.model.inputDecimal();
                this.view.updateDisplay(this.model.getDisplayState());
            },
            'negate': () => {
                this.model.negate();
                this.view.updateDisplay(this.model.getDisplayState());
            },
            'percent': () => {
                this.model.percent();
                this.view.updateDisplay(this.model.getDisplayState());
            },
            'mc': () => {
                this.model.memoryClear();
                this.view.updateMemoryIndicator(false);
                this.announceForScreenReader('Память очищена');
            },
            'mr': () => {
                this.model.memoryRecall();
                this.view.updateDisplay(this.model.getDisplayState());
                this.announceForScreenReader(`Из памяти: ${this.model.getCurrentValue()}`);
            },
            'm-plus': () => {
                this.model.memoryAdd();
                this.view.updateMemoryIndicator(true);
                this.announceForScreenReader('Добавлено в память');
            },
            'm-minus': () => {
                this.model.memorySubtract();
                this.view.updateMemoryIndicator(true);
                this.announceForScreenReader('Вычтено из памяти');
            },
            'ms': () => {
                this.model.memoryStore();
                this.view.updateMemoryIndicator(true);
                this.announceForScreenReader('Сохранено в память');
            },
            'lparen': () => {
                this.model.inputParenthesis('(');
                this.view.updateDisplay(this.model.getDisplayState());
            },
            'rparen': () => {
                this.model.inputParenthesis(')');
                this.view.updateDisplay(this.model.getDisplayState());
            },
        };
        
        const handler = actionHandlers[action];
        if (handler) {
            handler();
        } else {
            this.handleFunctionInput(action);
        }
    }
    
    /**
     * Handle scientific function input
     */
    handleFunctionInput(func) {
        const result = this.model.applyFunction(func);
        
        if (result.success) {
            this.view.updateDisplay(this.model.getDisplayState());
            this.announceForScreenReader(`${func}: ${result.value}`);
        } else {
            this.view.showError(result.error);
            this.announceForScreenReader(`Ошибка: ${result.error}`);
        }
    }
    
    /**
     * Handle constant input (pi, e)
     */
    handleConstantInput(constant) {
        this.model.insertConstant(constant);
        this.view.updateDisplay(this.model.getDisplayState());
        this.announceForScreenReader(constant === 'pi' ? 'Пи' : 'Число e');
    }
    
    /**
     * Handle mode change (DEG/RAD)
     */
    handleModeChange(mode) {
        this.model.setAngleMode(mode);
        this.view.updateModeIndicator(mode);
        this.announceForScreenReader(mode === 'deg' ? 'Режим градусы' : 'Режим радианы');
    }
    
    /**
     * Handle theme toggle
     */
    handleThemeToggle() {
        const themes = ['light', 'dark', 'high-contrast'];
        const currentTheme = document.body.getAttribute('data-theme') || 'light';
        const currentIndex = themes.indexOf(currentTheme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];
        
        document.body.setAttribute('data-theme', nextTheme);
        localStorage.setItem('calculator-theme', nextTheme);
        this.view.updateThemeToggle(nextTheme);
        
        const themeNames = { 'light': 'светлая', 'dark': 'тёмная', 'high-contrast': 'высокий контраст' };
        this.announceForScreenReader(`Тема: ${themeNames[nextTheme]}`);
    }
    
    /**
     * Handle history panel toggle
     */
    handleHistoryToggle() {
        const historyPanel = document.getElementById('historyPanel');
        const isOpen = historyPanel.classList.toggle('active');
        
        historyPanel.setAttribute('aria-hidden', !isOpen);
        document.getElementById('historyToggle').setAttribute('aria-expanded', isOpen);
        
        if (isOpen) {
            this.view.updateHistory(this.model.getHistory());
            const firstItem = historyPanel.querySelector('.history-panel__item');
            if (firstItem) {
                firstItem.focus();
            }
        }
    }
    
    /**
     * Handle history clear
     */
    handleHistoryClear() {
        this.model.clearHistory();
        this.view.updateHistory([]);
        this.announceForScreenReader('История очищена');
    }
    
    /**
     * Handle history navigation with arrow keys
     */
    handleHistoryNavigation(key) {
        const historyList = document.getElementById('historyList');
        const items = historyList.querySelectorAll('.history-panel__item');
        const focusedItem = document.activeElement.closest('.history-panel__item');
        
        if (!focusedItem || items.length === 0) return;
        
        const currentIndex = Array.from(items).indexOf(focusedItem);
        let nextIndex;
        
        if (key === 'ArrowUp') {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        } else {
            nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        }
        
        items[nextIndex].focus();
    }
    
    /**
     * Handle second function toggle
     */
    handleSecondToggle() {
        const isSecond = this.model.toggleSecondMode();
        this.view.updateSecondButton(isSecond);
        this.announceForScreenReader(isSecond ? 'Альтернативные функции включены' : 'Альтернативные функции выключены');
    }
    
    /**
     * Handle history item selection
     */
    handleHistoryItemSelect(index) {
        const historyItem = this.model.getHistoryItem(index);
        if (historyItem) {
            this.model.setCurrentValue(historyItem.result);
            this.view.updateDisplay(this.model.getDisplayState());
            this.handleHistoryToggle();
        }
    }
    
    /**
     * Get human-readable operator name
     */
    getOperatorName(operator) {
        const names = {
            '+': 'плюс',
            '-': 'минус',
            '×': 'умножить',
            '÷': 'разделить'
        };
        return names[operator] || operator;
    }
    
    /**
     * Announce message for screen readers
     */
    announceForScreenReader(message) {
        const announcer = document.getElementById('sr-announcer') || this.createScreenReaderAnnouncer();
        announcer.textContent = message;
    }
    
    /**
     * Create screen reader announcer element
     */
    createScreenReaderAnnouncer() {
        const announcer = document.createElement('div');
        announcer.id = 'sr-announcer';
        announcer.setAttribute('role', 'status');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'visually-hidden';
        document.body.appendChild(announcer);
        return announcer;
    }
    
    /**
     * Destroy controller and clean up event listeners
     */
    destroy() {
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
        }
    }
}

export { UIController };
