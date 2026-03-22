/**
 * Calculator - Main application entry point
 * Coordinates Model, View, and Controller (MVC pattern)
 */

import { CalculatorModel } from './CalculatorModel.js';
import { DisplayView } from './DisplayView.js';
import { UIController } from './UIController.js';

class Calculator {
    constructor() {
        this.model = null;
        this.view = null;
        this.controller = null;
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
     * Get current calculator value (for external access)
     */
    getValue() {
        return this.model.getCurrentValue();
    }
    
    /**
     * Set calculator value (for external access)
     */
    setValue(value) {
        this.model.setCurrentValue(value);
        this.view.updateDisplay(this.model.getDisplayState());
    }
    
    /**
     * Evaluate expression string (for external access)
     */
    evaluate(expression) {
        return this.model.calculate();
    }
    
    /**
     * Destroy calculator instance
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
