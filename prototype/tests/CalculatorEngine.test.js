/**
 * Comprehensive Unit Tests for Calculator Engine
 * Tests: ExpressionParser, CalculatorModel, ErrorHandler
 */

import { ExpressionParser } from '../js/ExpressionParser.js';
import { ErrorHandler } from '../js/ErrorHandler.js';

class TestSuite {
    constructor(name) {
        this.name = name;
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
        this.skipped = 0;
    }
    
    test(name, fn, options = {}) {
        this.tests.push({ name, fn, options });
    }
    
    skip(name, fn) {
        this.tests.push({ name, fn, options: { skip: true } });
    }
    
    async run() {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Test Suite: ${this.name}`);
        console.log('='.repeat(60));
        
        for (const test of this.tests) {
            if (test.options.skip) {
                this.skipped++;
                console.log(`⊘ SKIP: ${test.name}`);
                continue;
            }
            
            try {
                await test.fn();
                this.passed++;
                console.log(`✓ PASS: ${test.name}`);
            } catch (e) {
                this.failed++;
                console.log(`✗ FAIL: ${test.name}`);
                console.log(`  Error: ${e.message}`);
            }
        }
        
        console.log('-'.repeat(60));
        console.log(`Results: ${this.passed} passed, ${this.failed} failed, ${this.skipped} skipped`);
        return this.failed === 0;
    }
}

class Assert {
    static equal(actual, expected, message = '') {
        if (actual !== expected) {
            throw new Error(`${message} Expected: ${expected}, Got: ${actual}`);
        }
    }
    
    static notEqual(actual, expected, message = '') {
        if (actual === expected) {
            throw new Error(`${message} Values should not be equal: ${actual}`);
        }
    }
    
    static almostEqual(actual, expected, tolerance = 1e-10, message = '') {
        if (Math.abs(actual - expected) > tolerance) {
            throw new Error(`${message} Expected: ~${expected}, Got: ${actual} (tolerance: ${tolerance})`);
        }
    }
    
    static true(condition, message = '') {
        if (!condition) {
            throw new Error(message || 'Expected true');
        }
    }
    
    static false(condition, message = '') {
        if (condition) {
            throw new Error(message || 'Expected false');
        }
    }
    
    static throws(fn, expectedError = null, message = '') {
        let threw = false;
        let error = null;
        try {
            fn();
        } catch (e) {
            threw = true;
            error = e;
        }
        if (!threw) {
            throw new Error(message || 'Expected function to throw');
        }
        if (expectedError && !error.message.includes(expectedError)) {
            throw new Error(`Expected error containing "${expectedError}", got "${error.message}"`);
        }
    }
    
    static doesNotThrow(fn, message = '') {
        try {
            fn();
        } catch (e) {
            throw new Error(`${message} Unexpected error: ${e.message}`);
        }
    }
}

// ============================================================
// Expression Parser Tests
// ============================================================

const parserSuite = new TestSuite('ExpressionParser');
const parser = new ExpressionParser({ isDegreeMode: true });

// Basic Arithmetic
parserSuite.test('Addition: 2 + 3 = 5', () => {
    const result = parser.evaluate('2 + 3');
    Assert.true(result.success);
    Assert.equal(result.value, 5);
});

parserSuite.test('Subtraction: 10 - 7 = 3', () => {
    const result = parser.evaluate('10 - 7');
    Assert.true(result.success);
    Assert.equal(result.value, 3);
});

parserSuite.test('Multiplication: 6 × 8 = 48', () => {
    const result = parser.evaluate('6 * 8');
    Assert.true(result.success);
    Assert.equal(result.value, 48);
});

parserSuite.test('Division: 20 ÷ 4 = 5', () => {
    const result = parser.evaluate('20 / 4');
    Assert.true(result.success);
    Assert.equal(result.value, 5);
});

parserSuite.test('Division with remainder: 7 / 2 = 3.5', () => {
    const result = parser.evaluate('7 / 2');
    Assert.true(result.success);
    Assert.equal(result.value, 3.5);
});

parserSuite.test('Modulo: 17 % 5 = 2', () => {
    const result = parser.evaluate('17 % 5');
    Assert.true(result.success);
    Assert.equal(result.value, 2);
});

// Operator Precedence
parserSuite.test('Precedence: 2 + 3 * 4 = 14', () => {
    const result = parser.evaluate('2 + 3 * 4');
    Assert.true(result.success);
    Assert.equal(result.value, 14);
});

parserSuite.test('Precedence: 10 - 6 / 2 = 7', () => {
    const result = parser.evaluate('10 - 6 / 2');
    Assert.true(result.success);
    Assert.equal(result.value, 7);
});

parserSuite.test('Precedence: 2 * 3 + 4 * 5 = 26', () => {
    const result = parser.evaluate('2 * 3 + 4 * 5');
    Assert.true(result.success);
    Assert.equal(result.value, 26);
});

parserSuite.test('Precedence: 2 ^ 3 * 4 = 32', () => {
    const result = parser.evaluate('2 ^ 3 * 4');
    Assert.true(result.success);
    Assert.equal(result.value, 32);
});

// Parentheses
parserSuite.test('Parentheses: (2 + 3) * 4 = 20', () => {
    const result = parser.evaluate('(2 + 3) * 4');
    Assert.true(result.success);
    Assert.equal(result.value, 20);
});

parserSuite.test('Nested parentheses: ((2 + 3) * (4 - 1)) = 15', () => {
    const result = parser.evaluate('((2 + 3) * (4 - 1))');
    Assert.true(result.success);
    Assert.equal(result.value, 15);
});

parserSuite.test('Complex parentheses: (1 + (2 * (3 + 4))) = 15', () => {
    const result = parser.evaluate('(1 + (2 * (3 + 4)))');
    Assert.true(result.success);
    Assert.equal(result.value, 15);
});

// Unary Operators
parserSuite.test('Unary minus: -5 = -5', () => {
    const result = parser.evaluate('-5');
    Assert.true(result.success);
    Assert.equal(result.value, -5);
});

parserSuite.test('Unary minus in expression: -5 + 3 = -2', () => {
    const result = parser.evaluate('-5 + 3');
    Assert.true(result.success);
    Assert.equal(result.value, -2);
});

parserSuite.test('Unary minus after operator: 10 * -2 = -20', () => {
    const result = parser.evaluate('10 * -2');
    Assert.true(result.success);
    Assert.equal(result.value, -20);
});

parserSuite.test('Double unary minus: --5 = 5', () => {
    const result = parser.evaluate('--5');
    Assert.true(result.success);
    Assert.equal(result.value, 5);
});

// Power
parserSuite.test('Power: 2 ^ 10 = 1024', () => {
    const result = parser.evaluate('2 ^ 10');
    Assert.true(result.success);
    Assert.equal(result.value, 1024);
});

parserSuite.test('Power right associativity: 2 ^ 3 ^ 2 = 512', () => {
    const result = parser.evaluate('2 ^ 3 ^ 2');
    Assert.true(result.success);
    Assert.equal(result.value, 512);
});

parserSuite.test('Power with negative base: (-2) ^ 3 = -8', () => {
    const result = parser.evaluate('(-2) ^ 3');
    Assert.true(result.success);
    Assert.equal(result.value, -8);
});

// Constants
parserSuite.test('Constant π ≈ 3.14159', () => {
    const result = parser.evaluate('pi');
    Assert.true(result.success);
    Assert.almostEqual(result.value, Math.PI);
});

parserSuite.test('Constant e ≈ 2.71828', () => {
    const result = parser.evaluate('e');
    Assert.true(result.success);
    Assert.almostEqual(result.value, Math.E);
});

parserSuite.test('Unicode π', () => {
    const result = parser.evaluate('π');
    Assert.true(result.success);
    Assert.almostEqual(result.value, Math.PI);
});

// Trigonometric Functions (Degrees)
parserSuite.test('sin(0°) = 0', () => {
    const result = parser.evaluate('sin(0)');
    Assert.true(result.success);
    Assert.almostEqual(result.value, 0);
});

parserSuite.test('sin(30°) = 0.5', () => {
    const result = parser.evaluate('sin(30)');
    Assert.true(result.success);
    Assert.almostEqual(result.value, 0.5);
});

parserSuite.test('sin(90°) = 1', () => {
    const result = parser.evaluate('sin(90)');
    Assert.true(result.success);
    Assert.almostEqual(result.value, 1);
});

parserSuite.test('cos(0°) = 1', () => {
    const result = parser.evaluate('cos(0)');
    Assert.true(result.success);
    Assert.almostEqual(result.value, 1);
});

parserSuite.test('cos(60°) = 0.5', () => {
    const result = parser.evaluate('cos(60)');
    Assert.true(result.success);
    Assert.almostEqual(result.value, 0.5);
});

parserSuite.test('tan(45°) = 1', () => {
    const result = parser.evaluate('tan(45)');
    Assert.true(result.success);
    Assert.almostEqual(result.value, 1);
});

// Inverse Trigonometric Functions
parserSuite.test('asin(0.5) = 30°', () => {
    const result = parser.evaluate('asin(0.5)');
    Assert.true(result.success);
    Assert.almostEqual(result.value, 30);
});

parserSuite.test('acos(0.5) = 60°', () => {
    const result = parser.evaluate('acos(0.5)');
    Assert.true(result.success);
    Assert.almostEqual(result.value, 60);
});

parserSuite.test('atan(1) = 45°', () => {
    const result = parser.evaluate('atan(1)');
    Assert.true(result.success);
    Assert.almostEqual(result.value, 45);
});

// Logarithms
parserSuite.test('log(10) = 1', () => {
    const result = parser.evaluate('log(10)');
    Assert.true(result.success);
    Assert.equal(result.value, 1);
});

parserSuite.test('log(100) = 2', () => {
    const result = parser.evaluate('log(100)');
    Assert.true(result.success);
    Assert.equal(result.value, 2);
});

parserSuite.test('ln(e) = 1', () => {
    const result = parser.evaluate('ln(e)');
    Assert.true(result.success);
    Assert.almostEqual(result.value, 1);
});

parserSuite.test('ln(1) = 0', () => {
    const result = parser.evaluate('ln(1)');
    Assert.true(result.success);
    Assert.equal(result.value, 0);
});

// Roots
parserSuite.test('sqrt(4) = 2', () => {
    const result = parser.evaluate('sqrt(4)');
    Assert.true(result.success);
    Assert.equal(result.value, 2);
});

parserSuite.test('sqrt(2) ≈ 1.414', () => {
    const result = parser.evaluate('sqrt(2)');
    Assert.true(result.success);
    Assert.almostEqual(result.value, Math.SQRT2);
});

parserSuite.test('cbrt(27) = 3', () => {
    const result = parser.evaluate('cbrt(27)');
    Assert.true(result.success);
    Assert.equal(result.value, 3);
});

parserSuite.test('cbrt(-8) = -2', () => {
    const result = parser.evaluate('cbrt(-8)');
    Assert.true(result.success);
    Assert.equal(result.value, -2);
});

// Factorial
parserSuite.test('fact(0) = 1', () => {
    const result = parser.evaluate('fact(0)');
    Assert.true(result.success);
    Assert.equal(result.value, 1);
});

parserSuite.test('fact(5) = 120', () => {
    const result = parser.evaluate('fact(5)');
    Assert.true(result.success);
    Assert.equal(result.value, 120);
});

parserSuite.test('5! = 120', () => {
    const result = parser.evaluate('5!');
    Assert.true(result.success);
    Assert.equal(result.value, 120);
});

parserSuite.test('fact(10) = 3628800', () => {
    const result = parser.evaluate('fact(10)');
    Assert.true(result.success);
    Assert.equal(result.value, 3628800);
});

// Other Functions
parserSuite.test('abs(-42) = 42', () => {
    const result = parser.evaluate('abs(-42)');
    Assert.true(result.success);
    Assert.equal(result.value, 42);
});

parserSuite.test('floor(3.7) = 3', () => {
    const result = parser.evaluate('floor(3.7)');
    Assert.true(result.success);
    Assert.equal(result.value, 3);
});

parserSuite.test('ceil(3.2) = 4', () => {
    const result = parser.evaluate('ceil(3.2)');
    Assert.true(result.success);
    Assert.equal(result.value, 4);
});

parserSuite.test('round(3.5) = 4', () => {
    const result = parser.evaluate('round(3.5)');
    Assert.true(result.success);
    Assert.equal(result.value, 4);
});

parserSuite.test('max(3, 7) = 7', () => {
    const result = parser.evaluate('max(3, 7)');
    Assert.true(result.success);
    Assert.equal(result.value, 7);
});

parserSuite.test('min(3, 7) = 3', () => {
    const result = parser.evaluate('min(3, 7)');
    Assert.true(result.success);
    Assert.equal(result.value, 3);
});

parserSuite.test('gcd(12, 18) = 6', () => {
    const result = parser.evaluate('gcd(12, 18)');
    Assert.true(result.success);
    Assert.equal(result.value, 6);
});

parserSuite.test('lcm(4, 6) = 12', () => {
    const result = parser.evaluate('lcm(4, 6)');
    Assert.true(result.success);
    Assert.equal(result.value, 12);
});

// Complex Expressions
parserSuite.test('Complex: sqrt(3^2 + 4^2) = 5', () => {
    const result = parser.evaluate('sqrt(3^2 + 4^2)');
    Assert.true(result.success);
    Assert.equal(result.value, 5);
});

parserSuite.test('Complex: 2 + 3 * sin(30) = 3.5', () => {
    const result = parser.evaluate('2 + 3 * sin(30)');
    Assert.true(result.success);
    Assert.almostEqual(result.value, 3.5);
});

parserSuite.test('Complex: (sin(30))^2 + (cos(30))^2 = 1', () => {
    const result = parser.evaluate('(sin(30))^2 + (cos(30))^2');
    Assert.true(result.success);
    Assert.almostEqual(result.value, 1);
});

// Implicit Multiplication
parserSuite.test('Implicit: 2pi ≈ 6.28', () => {
    const result = parser.evaluate('2pi');
    Assert.true(result.success);
    Assert.almostEqual(result.value, 2 * Math.PI);
});

parserSuite.test('Implicit: 2(3+4) = 14', () => {
    const result = parser.evaluate('2(3+4)');
    Assert.true(result.success);
    Assert.equal(result.value, 14);
});

parserSuite.test('Implicit: (2)(3) = 6', () => {
    const result = parser.evaluate('(2)(3)');
    Assert.true(result.success);
    Assert.equal(result.value, 6);
});

// Scientific Notation
parserSuite.test('Scientific: 1.5e3 = 1500', () => {
    const result = parser.evaluate('1.5e3');
    Assert.true(result.success);
    Assert.equal(result.value, 1500);
});

parserSuite.test('Scientific: 2e-2 = 0.02', () => {
    const result = parser.evaluate('2e-2');
    Assert.true(result.success);
    Assert.equal(result.value, 0.02);
});

parserSuite.test('Scientific: 6.022e23 (Avogadro)', () => {
    const result = parser.evaluate('6.022e23');
    Assert.true(result.success);
    Assert.almostEqual(result.value, 6.022e23, 1e20);
});

// Error Cases
parserSuite.test('Error: Division by zero', () => {
    const result = parser.evaluate('5 / 0');
    Assert.false(result.success);
    Assert.true(result.error.includes('ноль') || result.error.includes('zero'));
});

parserSuite.test('Error: sqrt(-1)', () => {
    const result = parser.evaluate('sqrt(-1)');
    Assert.false(result.success);
});

parserSuite.test('Error: log(0)', () => {
    const result = parser.evaluate('log(0)');
    Assert.false(result.success);
});

parserSuite.test('Error: log(-5)', () => {
    const result = parser.evaluate('log(-5)');
    Assert.false(result.success);
});

parserSuite.test('Error: asin(2)', () => {
    const result = parser.evaluate('asin(2)');
    Assert.false(result.success);
});

parserSuite.test('Error: acos(-2)', () => {
    const result = parser.evaluate('acos(-2)');
    Assert.false(result.success);
});

parserSuite.test('Error: fact(-1)', () => {
    const result = parser.evaluate('fact(-1)');
    Assert.false(result.success);
});

parserSuite.test('Error: fact(1.5)', () => {
    const result = parser.evaluate('fact(1.5)');
    Assert.false(result.success);
});

parserSuite.test('Error: Unbalanced parentheses (open)', () => {
    const result = parser.evaluate('(2 + 3');
    Assert.false(result.success);
    Assert.true(result.error.includes('скобки') || result.error.includes('parenthes'));
});

parserSuite.test('Error: Unbalanced parentheses (close)', () => {
    const result = parser.evaluate('2 + 3)');
    Assert.false(result.success);
});

parserSuite.test('Error: Empty expression', () => {
    const result = parser.evaluate('');
    Assert.false(result.success);
});

parserSuite.test('Error: Unknown function', () => {
    const result = parser.evaluate('unknown(5)');
    Assert.false(result.success);
});

// Radian Mode Tests
parserSuite.test('Radian mode: sin(π/2) = 1', () => {
    parser.setDegreeMode(false);
    const result = parser.evaluate('sin(pi/2)');
    parser.setDegreeMode(true);
    Assert.true(result.success);
    Assert.almostEqual(result.value, 1);
});

parserSuite.test('Radian mode: cos(π) = -1', () => {
    parser.setDegreeMode(false);
    const result = parser.evaluate('cos(pi)');
    parser.setDegreeMode(true);
    Assert.true(result.success);
    Assert.almostEqual(result.value, -1);
});

// Edge Cases
parserSuite.test('Edge: Very large number', () => {
    const result = parser.evaluate('1e100 * 1e100');
    Assert.true(result.success);
    Assert.equal(result.value, 1e200);
});

parserSuite.test('Edge: Very small number', () => {
    const result = parser.evaluate('1e-100 * 1e-100');
    Assert.true(result.success);
    Assert.equal(result.value, 1e-200);
});

parserSuite.test('Edge: Zero operations', () => {
    const result = parser.evaluate('0 * 1000000');
    Assert.true(result.success);
    Assert.equal(result.value, 0);
});

parserSuite.test('Edge: Negative zero', () => {
    const result = parser.evaluate('-0');
    Assert.true(result.success);
    Assert.equal(result.value, 0);
});

// ============================================================
// Error Handler Tests
// ============================================================

const errorSuite = new TestSuite('ErrorHandler');
const errorHandler = new ErrorHandler();

errorSuite.test('Get error details: DIVISION_BY_ZERO', () => {
    const details = errorHandler.getErrorDetails('DIVISION_BY_ZERO');
    Assert.true(details.title.length > 0);
    Assert.true(details.message.length > 0);
    Assert.equal(details.severity, 'error');
});

errorSuite.test('Get error details: unknown code returns generic', () => {
    const details = errorHandler.getErrorDetails('UNKNOWN_CODE');
    Assert.true(details.message.length > 0);
});

errorSuite.test('Map raw error: "деление на ноль"', () => {
    const details = errorHandler.getErrorDetails('деление на ноль');
    Assert.true(details.title.includes('ноль') || details.message.includes('ноль'));
});

errorSuite.test('Validate expression: balanced parentheses', () => {
    const result = errorHandler.validateExpression('(2 + 3) * 4');
    Assert.true(result.valid);
});

errorSuite.test('Validate expression: unbalanced parentheses', () => {
    const result = errorHandler.validateExpression('(2 + 3 * 4');
    Assert.false(result.valid);
    Assert.true(result.errors.some(e => e.code === 'UNBALANCED_PARENTHESES'));
});

errorSuite.test('Validate expression: multiple decimals', () => {
    const result = errorHandler.validateExpression('3.14.15');
    Assert.false(result.valid);
    Assert.true(result.errors.some(e => e.code === 'TOO_MANY_DECIMALS'));
});

errorSuite.test('Validate result: normal number', () => {
    const result = errorHandler.validateResult(42);
    Assert.true(result.valid);
});

errorSuite.test('Validate result: NaN', () => {
    const result = errorHandler.validateResult(NaN);
    Assert.false(result.valid);
    Assert.equal(result.error, 'NAN_RESULT');
});

errorSuite.test('Validate result: Infinity', () => {
    const result = errorHandler.validateResult(Infinity);
    Assert.true(result.valid);
    Assert.equal(result.warning, 'INFINITY_RESULT');
});

errorSuite.test('Validate result: -Infinity', () => {
    const result = errorHandler.validateResult(-Infinity);
    Assert.true(result.valid);
    Assert.equal(result.value, '-∞');
});

errorSuite.test('Format error message', () => {
    const message = errorHandler.formatError('DIVISION_BY_ZERO');
    Assert.true(message.length > 0);
    Assert.true(typeof message === 'string');
});

errorSuite.test('Get severity: error', () => {
    const severity = errorHandler.getSeverity('DIVISION_BY_ZERO');
    Assert.equal(severity, 'error');
});

errorSuite.test('Get severity: warning', () => {
    const severity = errorHandler.getSeverity('MAX_DIGITS_REACHED');
    Assert.equal(severity, 'warning');
});

// ============================================================
// Run All Tests
// ============================================================

async function runAllTests() {
    console.log('\n' + '█'.repeat(60));
    console.log('  CALCULATOR ENGINE - UNIT TESTS');
    console.log('█'.repeat(60));
    
    const results = [];
    
    results.push(await parserSuite.run());
    results.push(await errorSuite.run());
    
    const allPassed = results.every(r => r);
    
    console.log('\n' + '█'.repeat(60));
    console.log(allPassed ? '  ALL TESTS PASSED ✓' : '  SOME TESTS FAILED ✗');
    console.log('█'.repeat(60) + '\n');
    
    return allPassed;
}

// Export for use in browser/Node
export { TestSuite, Assert, parserSuite, errorSuite, runAllTests };

// Run if executed directly
if (typeof window === 'undefined') {
    runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    });
}
