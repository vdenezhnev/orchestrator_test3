/**
 * @fileoverview Calculator - Main application entry point
 * @description Coordinates Model, View, and Controller components using the MVC pattern.
 * Handles application lifecycle, state persistence, and provides external API.
 * 
 * @module Calculator
 * @version 1.0.0
 * @author Engineering Calculator Project
 * 
 * @example
 * // Auto-initialization on DOMContentLoaded
 * // Access via window.calculator
 * window.calculator.evaluate('2 + 3');
 * window.calculator.getValue();
 * 
 * @example
 * // Manual initialization
 * import { Calculator } from './Calculator.js';
 * const calc = new Calculator();
 * calc.setValue('42');
 */

import { CalculatorModel } from './CalculatorModel.js';
import { DisplayView } from './DisplayView.js';
import { UIController } from './UIController.js';

/**
 * Main Calculator application class
 * @class Calculator
 * @description Orchestrates the MVC components and manages application state
 */
class Calculator {
    /**
     * Creates a new Calculator instance
     * @constructor
     * @description Initializes Model, View, Controller and sets up persistence
     */
    constructor() {
        /** @type {CalculatorModel|null} */
        this.model = null;
        
        /** @type {DisplayView|null} */
        this.view = null;
        
        /** @type {UIController|null} */
        this.controller = null;
        
        /** @type {string} localStorage key for state persistence */
        this.storageKey = 'calculator-state';
        
        this.init();
    }
    
    /**
     * Initialize the calculator application
     */
    init() {
        this.model = new CalculatorModel();
        this.view = new DisplayView();
        this.controller = new UIController(this.model, this.view);
        
        this.loadState();
        
        this.bindCustomEvents();
        
        this.view.updateDisplay(this.model.getDisplayState());
        this.view.updateHistory(this.model.getHistory());
        
        this.setupAutoSave();
        
        console.log('Calculator initialized');
    }
    
    /**
     * Bind custom events for communication between components
     */
    bindCustomEvents() {
        document.addEventListener('historyItemSelect', (e) => {
            this.controller.handleHistoryItemSelect(e.detail.index);
        });
        
        window.addEventListener('beforeunload', () => {
            this.saveState();
        });
        
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.saveState();
            }
        });
    }
    
    /**
     * Setup auto-save interval
     */
    setupAutoSave() {
        setInterval(() => {
            this.saveState();
        }, 30000);
    }
    
    /**
     * Save calculator state to localStorage
     */
    saveState() {
        try {
            const state = this.model.exportState();
            localStorage.setItem(this.storageKey, JSON.stringify(state));
        } catch (e) {
            console.warn('Failed to save calculator state:', e);
        }
    }
    
    /**
     * Load calculator state from localStorage
     */
    loadState() {
        try {
            const savedState = localStorage.getItem(this.storageKey);
            if (savedState) {
                const state = JSON.parse(savedState);
                this.model.importState(state);
            }
        } catch (e) {
            console.warn('Failed to load calculator state:', e);
        }
    }
    
    /**
     * Reset calculator to initial state
     */
    reset() {
        this.model.reset();
        this.model.clearHistory();
        this.view.updateDisplay(this.model.getDisplayState());
        this.view.updateHistory([]);
        this.view.clearOperatorHighlight();
        localStorage.removeItem(this.storageKey);
    }
    
    /**
     * Get current calculator value
     * @public
     * @returns {string} Current display value
     * @example
     * const value = calculator.getValue();
     * console.log(value); // "123.456"
     */
    getValue() {
        return this.model.getCurrentValue();
    }
    
    /**
     * Set calculator value programmatically
     * @public
     * @param {string|number} value - Value to set
     * @example
     * calculator.setValue(42);
     * calculator.setValue("3.14159");
     */
    setValue(value) {
        this.model.setCurrentValue(value);
        this.view.updateDisplay(this.model.getDisplayState());
    }
    
    /**
     * Evaluate the current expression
     * @public
     * @returns {Object} Result object with value or error
     * @property {boolean} success - Whether evaluation succeeded
     * @property {number} [value] - Calculated result (if success)
     * @property {string} [error] - Error message (if failed)
     * @example
     * const result = calculator.evaluate();
     * if (result.success) {
     *   console.log('Result:', result.value);
     * }
     */
    evaluate(expression) {
        return this.model.calculate();
    }
    
    /**
     * Destroy calculator instance and cleanup resources
     * @public
     * @description Saves state, removes event listeners, and nullifies references
     */
    destroy() {
        this.saveState();
        this.controller.destroy();
        this.model = null;
        this.view = null;
        this.controller = null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.calculator = new Calculator();
});

export { Calculator };
