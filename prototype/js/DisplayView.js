/**
 * DisplayView - Handles all UI rendering and visual updates
 * Implements the View part of MVC pattern
 */

class DisplayView {
    constructor() {
        this.elements = {};
        this.animationDuration = 100;
        this.errorTimeout = null;
        
        this.init();
    }
    
    /**
     * Initialize view and cache DOM elements
     */
    init() {
        this.cacheElements();
        this.loadSavedTheme();
    }
    
    /**
     * Cache frequently accessed DOM elements
     */
    cacheElements() {
        this.elements = {
            calculator: document.getElementById('calculator'),
            expression: document.getElementById('expression'),
            result: document.getElementById('result'),
            display: document.querySelector('.display'),
            memoryIndicator: document.getElementById('memoryIndicator'),
            modeIndicator: document.getElementById('modeIndicator'),
            themeToggle: document.getElementById('themeToggle'),
            historyToggle: document.getElementById('historyToggle'),
            historyPanel: document.getElementById('historyPanel'),
            historyList: document.getElementById('historyList'),
            secondBtn: document.getElementById('secondBtn'),
            operatorKeys: document.querySelectorAll('.key--operator'),
            allKeys: document.querySelectorAll('.key')
        };
    }
    
    /**
     * Load saved theme preference
     */
    loadSavedTheme() {
        const savedTheme = localStorage.getItem('calculator-theme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
        this.updateThemeToggle(savedTheme);
    }
    
    /**
     * Update the main display with current state
     */
    updateDisplay(state) {
        if (!state) return;
        
        this.updateResultDisplay(state.currentValue);
        this.updateExpressionDisplay(state.expression);
        this.updateMemoryIndicator(state.hasMemory);
        this.updateModeIndicator(state.angleMode);
        
        this.clearErrorState();
    }
    
    /**
     * Update result display with animation
     */
    updateResultDisplay(value) {
        const resultEl = this.elements.result;
        if (!resultEl) return;
        
        const formattedValue = this.formatDisplayValue(value);
        
        if (resultEl.textContent !== formattedValue) {
            resultEl.style.opacity = '0.7';
            resultEl.textContent = formattedValue;
            
            requestAnimationFrame(() => {
                resultEl.style.transition = 'opacity 100ms ease-out';
                resultEl.style.opacity = '1';
            });
        }
        
        this.adjustFontSize(resultEl, formattedValue);
    }
    
    /**
     * Adjust font size based on content length
     */
    adjustFontSize(element, value) {
        const length = value.length;
        let fontSize;
        
        if (length <= 8) {
            fontSize = '';
        } else if (length <= 12) {
            fontSize = 'clamp(1.5rem, 6vw, 2.5rem)';
        } else if (length <= 16) {
            fontSize = 'clamp(1.2rem, 5vw, 2rem)';
        } else {
            fontSize = 'clamp(1rem, 4vw, 1.5rem)';
        }
        
        element.style.fontSize = fontSize;
    }
    
    /**
     * Format value for display (add thousand separators, etc.)
     */
    formatDisplayValue(value) {
        if (!value || value === 'Ошибка' || value.includes('e') || value.includes('∞')) {
            return value;
        }
        
        const parts = value.split('.');
        const integerPart = parts[0];
        const decimalPart = parts[1];
        
        if (integerPart.length > 3 && !integerPart.includes(' ')) {
            const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
            return decimalPart !== undefined ? `${formatted}.${decimalPart}` : formatted;
        }
        
        return value;
    }
    
    /**
     * Update expression display
     */
    updateExpressionDisplay(expression) {
        const expressionEl = this.elements.expression;
        if (!expressionEl) return;
        
        expressionEl.textContent = expression || '';
    }
    
    /**
     * Update memory indicator visibility
     */
    updateMemoryIndicator(hasMemory) {
        const indicator = this.elements.memoryIndicator;
        if (!indicator) return;
        
        indicator.classList.toggle('active', hasMemory);
        indicator.setAttribute('aria-hidden', !hasMemory);
    }
    
    /**
     * Update angle mode indicator
     */
    updateModeIndicator(mode) {
        const indicator = this.elements.modeIndicator;
        if (!indicator) return;
        
        const modeUpper = (mode || 'DEG').toUpperCase();
        const modeLower = modeUpper.toLowerCase();
        
        indicator.textContent = modeUpper;
        indicator.classList.toggle('indicator--rad', modeLower === 'rad');
        
        document.querySelectorAll('.mode-selector__btn').forEach(btn => {
            const isActive = btn.dataset.mode === modeLower;
            btn.classList.toggle('mode-selector__btn--active', isActive);
            btn.setAttribute('aria-checked', isActive);
        });
        
        this.updateTrigFunctionLabels(modeLower);
    }
    
    /**
     * Update trig function button labels based on mode
     */
    updateTrigFunctionLabels(mode) {
        const trigFunctions = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan'];
        const isRad = mode === 'rad';
        
        trigFunctions.forEach(func => {
            const btn = document.querySelector(`[data-action="${func}"]`);
            if (btn) {
                btn.classList.toggle('key--rad-mode', isRad);
                
                const tooltip = isRad ? `${func} (радианы)` : `${func} (градусы)`;
                btn.setAttribute('title', tooltip);
            }
        });
    }
    
    /**
     * Update theme toggle button state
     */
    updateThemeToggle(theme) {
        const toggle = this.elements.themeToggle;
        if (!toggle) return;
        
        const isDark = theme === 'dark' || theme === 'high-contrast';
        toggle.setAttribute('aria-pressed', isDark);
        
        const themeLabels = {
            'light': 'светлая',
            'dark': 'тёмная',
            'high-contrast': 'высокий контраст'
        };
        
        toggle.setAttribute('aria-label', 
            `Текущая тема: ${themeLabels[theme]}. Нажмите для переключения.`
        );
    }
    
    /**
     * Update second function button state
     */
    updateSecondButton(isActive) {
        const btn = this.elements.secondBtn;
        if (!btn) return;
        
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', isActive);
    }
    
    /**
     * Highlight active operator key
     */
    highlightActiveOperator(operator) {
        this.clearOperatorHighlight();
        
        const opMap = { '+': 'add', '-': 'subtract', '×': 'multiply', '÷': 'divide' };
        const action = opMap[operator];
        
        if (action) {
            const key = document.querySelector(`[data-action="${action}"]`);
            if (key) {
                key.classList.add('active');
                key.setAttribute('aria-pressed', 'true');
            }
        }
    }
    
    /**
     * Clear all operator highlights
     */
    clearOperatorHighlight() {
        this.elements.operatorKeys.forEach(key => {
            key.classList.remove('active');
            key.setAttribute('aria-pressed', 'false');
        });
    }
    
    /**
     * Animate key press
     */
    animateKeyPress(element) {
        if (!element) return;
        
        element.classList.add('pressed');
        
        setTimeout(() => {
            element.classList.remove('pressed');
        }, this.animationDuration);
    }
    
    /**
     * Animate key by CSS selector
     */
    animateKeyBySelector(selector) {
        if (!selector) return;
        
        const key = document.querySelector(selector);
        if (key) {
            this.animateKeyPress(key);
        }
    }
    
    /**
     * Highlight key on focus
     */
    highlightKey(element) {
        element.classList.add('focused');
    }
    
    /**
     * Remove key highlight on blur
     */
    unhighlightKey(element) {
        element.classList.remove('focused');
    }
    
    /**
     * Show error message
     * @param {string} message - Error message to display
     * @param {Object} options - Display options
     */
    showError(message, options = {}) {
        const display = this.elements.display;
        const result = this.elements.result;
        const expression = this.elements.expression;
        
        if (!display || !result) return;
        
        if (this.errorTimeout) {
            clearTimeout(this.errorTimeout);
        }
        
        const severity = options.severity || 'error';
        const errorCode = options.errorCode;
        const blocked = options.blocked;
        const duration = options.duration || (severity === 'warning' ? 1500 : 2500);
        
        display.classList.remove('display--error', 'display--warning', 'display--blocked');
        display.classList.add(`display--${severity}`);
        
        if (blocked) {
            display.classList.add('display--blocked');
            this.showBlockedFeedback();
        }
        
        result.textContent = message;
        result.setAttribute('role', 'alert');
        result.setAttribute('aria-live', 'assertive');
        
        if (expression && errorCode) {
            expression.textContent = this.getErrorIcon(errorCode);
            expression.classList.add('expression--error');
        }
        
        display.classList.add('shake');
        setTimeout(() => display.classList.remove('shake'), 300);
        
        this.errorTimeout = setTimeout(() => {
            this.clearErrorState();
            result.setAttribute('role', 'status');
            result.setAttribute('aria-live', 'polite');
            if (expression) {
                expression.classList.remove('expression--error');
            }
        }, duration);
    }
    
    /**
     * Show warning message (less severe than error)
     */
    showWarning(message, options = {}) {
        this.showError(message, { ...options, severity: 'warning' });
    }
    
    /**
     * Show blocked input feedback
     */
    showBlockedFeedback() {
        const calculator = this.elements.calculator;
        if (!calculator) return;
        
        calculator.classList.add('input-blocked');
        setTimeout(() => calculator.classList.remove('input-blocked'), 200);
    }
    
    /**
     * Get error icon for error code
     */
    getErrorIcon(errorCode) {
        const icons = {
            'DIVISION_BY_ZERO': '÷ 0',
            'SQRT_NEGATIVE': '√ −',
            'LOG_NON_POSITIVE': 'log ≤0',
            'ASIN_OUT_OF_RANGE': 'asin ∉',
            'ACOS_OUT_OF_RANGE': 'acos ∉',
            'TAN_UNDEFINED': 'tan ∞',
            'FACTORIAL_INVALID': 'n! ✗',
            'FACTORIAL_OVERFLOW': 'n! ∞',
            'OVERFLOW': '∞',
            'UNBALANCED_PARENTHESES': '( ≠ )',
            'TOO_MANY_DECIMALS': '. . .',
            'MAX_DIGITS_REACHED': '15+',
            'EMPTY_EXPRESSION': '∅',
            'INVALID_EXPRESSION': '✗',
        };
        return icons[errorCode] || '!';
    }
    
    /**
     * Show parentheses count indicator
     */
    showParenthesesIndicator(count) {
        let indicator = document.getElementById('parenIndicator');
        
        if (!indicator) {
            indicator = document.createElement('span');
            indicator.id = 'parenIndicator';
            indicator.className = 'indicator indicator--paren';
            this.elements.display.querySelector('.display__indicators')?.appendChild(indicator);
        }
        
        indicator.textContent = '(' + count;
        indicator.style.display = 'inline-flex';
        indicator.setAttribute('aria-label', `${count} незакрытых скобок`);
    }
    
    /**
     * Hide parentheses indicator
     */
    hideParenthesesIndicator() {
        const indicator = document.getElementById('parenIndicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }
    
    /**
     * Show function application feedback
     */
    showFunctionFeedback(funcName, input, output, mode) {
        const expression = this.elements.expression;
        if (!expression) return;
        
        const modeLabel = mode === 'rad' ? 'rad' : '°';
        let feedbackText;
        
        const trigFunctions = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan'];
        if (trigFunctions.includes(funcName)) {
            if (funcName.startsWith('a')) {
                feedbackText = `${funcName}(${input}) = ${output}${modeLabel}`;
            } else {
                feedbackText = `${funcName}(${input}${modeLabel}) = ${output}`;
            }
        } else {
            feedbackText = `${funcName}(${input}) = ${output}`;
        }
        
        expression.textContent = feedbackText;
        expression.classList.add('expression--function');
        
        setTimeout(() => {
            expression.classList.remove('expression--function');
        }, 2000);
    }
    
    /**
     * Clear error state
     */
    clearErrorState() {
        const display = this.elements.display;
        if (display) {
            display.classList.remove('display--error');
        }
    }
    
    /**
     * Show temporary feedback message
     */
    showFeedback(message, duration = 1000) {
        const feedback = document.createElement('div');
        feedback.className = 'feedback-toast';
        feedback.textContent = message;
        feedback.setAttribute('role', 'status');
        feedback.setAttribute('aria-live', 'polite');
        
        this.elements.calculator.appendChild(feedback);
        
        requestAnimationFrame(() => {
            feedback.classList.add('visible');
        });
        
        setTimeout(() => {
            feedback.classList.remove('visible');
            setTimeout(() => feedback.remove(), 300);
        }, duration);
    }
    
    /**
     * Update history panel
     */
    updateHistory(history) {
        const list = this.elements.historyList;
        if (!list) return;
        
        if (!history || history.length === 0) {
            list.innerHTML = '<li class="history-panel__empty">История пуста</li>';
            return;
        }
        
        list.innerHTML = history.map((item, index) => `
            <li class="history-panel__item" 
                tabindex="0" 
                data-index="${index}" 
                role="button"
                aria-label="${this.escapeHtml(item.expression)} равно ${this.escapeHtml(item.result)}"
            >
                <div class="history-panel__expression">${this.escapeHtml(item.expression)} =</div>
                <div class="history-panel__result">${this.escapeHtml(item.result)}</div>
            </li>
        `).join('');
        
        this.bindHistoryItemEvents();
    }
    
    /**
     * Bind events to history items
     */
    bindHistoryItemEvents() {
        const list = this.elements.historyList;
        if (!list) return;
        
        list.querySelectorAll('.history-panel__item').forEach(item => {
            item.addEventListener('click', () => {
                const event = new CustomEvent('historyItemSelect', {
                    detail: { index: parseInt(item.dataset.index) }
                });
                document.dispatchEvent(event);
            });
            
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    item.click();
                }
            });
        });
    }
    
    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    }
    
    /**
     * Enable/disable all keys
     */
    setKeysEnabled(enabled) {
        this.elements.allKeys.forEach(key => {
            key.disabled = !enabled;
            key.setAttribute('aria-disabled', !enabled);
        });
    }
    
    /**
     * Add ripple effect to element
     */
    addRippleEffect(element, event) {
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
        
        element.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }
    
    /**
     * Scroll display to show latest content
     */
    scrollDisplayToEnd() {
        const display = this.elements.display;
        if (display) {
            display.scrollLeft = display.scrollWidth;
        }
    }
}

export { DisplayView };
