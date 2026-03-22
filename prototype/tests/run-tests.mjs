/**
 * Node.js Test Runner for Calculator Engine
 * Run with: node --experimental-vm-modules run-tests.mjs
 */

import { ExpressionParser } from '../js/ExpressionParser.js';
import { ErrorHandler } from '../js/ErrorHandler.js';

const COLORS = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    gray: '\x1b[90m',
    bold: '\x1b[1m'
};

class TestRunner {
    constructor() {
        this.parser = new ExpressionParser({ isDegreeMode: true });
        this.errorHandler = new ErrorHandler();
        this.passed = 0;
        this.failed = 0;
        this.tests = [];
    }
    
    test(name, fn) {
        this.tests.push({ name, fn });
    }
    
    assert(condition, message) {
        if (!condition) throw new Error(message || 'Assertion failed');
    }
    
    assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(`${message || ''} Expected: ${expected}, Got: ${actual}`);
        }
    }
    
    assertAlmostEqual(actual, expected, tolerance = 1e-10) {
        if (Math.abs(actual - expected) > tolerance) {
            throw new Error(`Expected: ~${expected}, Got: ${actual}`);
        }
    }
    
    async run() {
        console.log(`\n${COLORS.bold}${COLORS.blue}═══════════════════════════════════════════════════════════${COLORS.reset}`);
        console.log(`${COLORS.bold}  CALCULATOR ENGINE - UNIT TESTS${COLORS.reset}`);
        console.log(`${COLORS.blue}═══════════════════════════════════════════════════════════${COLORS.reset}\n`);
        
        for (const test of this.tests) {
            try {
                await test.fn();
                this.passed++;
                console.log(`${COLORS.green}✓${COLORS.reset} ${test.name}`);
            } catch (e) {
                this.failed++;
                console.log(`${COLORS.red}✗${COLORS.reset} ${test.name}`);
                console.log(`${COLORS.gray}  └─ ${e.message}${COLORS.reset}`);
            }
        }
        
        console.log(`\n${COLORS.blue}───────────────────────────────────────────────────────────${COLORS.reset}`);
        console.log(`${COLORS.green}Passed: ${this.passed}${COLORS.reset}  ${COLORS.red}Failed: ${this.failed}${COLORS.reset}  Total: ${this.tests.length}`);
        console.log(`${COLORS.blue}═══════════════════════════════════════════════════════════${COLORS.reset}\n`);
        
        return this.failed === 0;
    }
    
    setupTests() {
        const p = this.parser;
        const eh = this.errorHandler;
        
        // === BASIC ARITHMETIC ===
        this.test('Addition: 2 + 3 = 5', () => {
            const r = p.evaluate('2 + 3');
            this.assert(r.success);
            this.assertEqual(r.value, 5);
        });
        
        this.test('Subtraction: 10 - 7 = 3', () => {
            const r = p.evaluate('10 - 7');
            this.assert(r.success);
            this.assertEqual(r.value, 3);
        });
        
        this.test('Multiplication: 6 × 8 = 48', () => {
            const r = p.evaluate('6 * 8');
            this.assert(r.success);
            this.assertEqual(r.value, 48);
        });
        
        this.test('Division: 20 ÷ 4 = 5', () => {
            const r = p.evaluate('20 / 4');
            this.assert(r.success);
            this.assertEqual(r.value, 5);
        });
        
        this.test('Modulo: 17 % 5 = 2', () => {
            const r = p.evaluate('17 % 5');
            this.assert(r.success);
            this.assertEqual(r.value, 2);
        });
        
        this.test('Power: 2 ^ 10 = 1024', () => {
            const r = p.evaluate('2 ^ 10');
            this.assert(r.success);
            this.assertEqual(r.value, 1024);
        });
        
        // === OPERATOR PRECEDENCE ===
        this.test('Precedence: 2 + 3 * 4 = 14', () => {
            const r = p.evaluate('2 + 3 * 4');
            this.assert(r.success);
            this.assertEqual(r.value, 14);
        });
        
        this.test('Precedence: 10 - 6 / 2 = 7', () => {
            const r = p.evaluate('10 - 6 / 2');
            this.assert(r.success);
            this.assertEqual(r.value, 7);
        });
        
        this.test('Power right associativity: 2 ^ 3 ^ 2 = 512', () => {
            const r = p.evaluate('2 ^ 3 ^ 2');
            this.assert(r.success);
            this.assertEqual(r.value, 512);
        });
        
        // === PARENTHESES ===
        this.test('Parentheses: (2 + 3) * 4 = 20', () => {
            const r = p.evaluate('(2 + 3) * 4');
            this.assert(r.success);
            this.assertEqual(r.value, 20);
        });
        
        this.test('Nested parentheses: ((2 + 3) * (4 - 1)) = 15', () => {
            const r = p.evaluate('((2 + 3) * (4 - 1))');
            this.assert(r.success);
            this.assertEqual(r.value, 15);
        });
        
        // === UNARY OPERATORS ===
        this.test('Unary minus: -5 = -5', () => {
            const r = p.evaluate('-5');
            this.assert(r.success);
            this.assertEqual(r.value, -5);
        });
        
        this.test('Unary in expression: 10 * -2 = -20', () => {
            const r = p.evaluate('10 * -2');
            this.assert(r.success);
            this.assertEqual(r.value, -20);
        });
        
        // === CONSTANTS ===
        this.test('Constant π ≈ 3.14159', () => {
            const r = p.evaluate('pi');
            this.assert(r.success);
            this.assertAlmostEqual(r.value, Math.PI);
        });
        
        this.test('Constant e ≈ 2.71828', () => {
            const r = p.evaluate('e');
            this.assert(r.success);
            this.assertAlmostEqual(r.value, Math.E);
        });
        
        // === TRIGONOMETRIC FUNCTIONS (DEGREES) ===
        this.test('sin(0°) = 0', () => {
            const r = p.evaluate('sin(0)');
            this.assert(r.success);
            this.assertAlmostEqual(r.value, 0);
        });
        
        this.test('sin(30°) = 0.5', () => {
            const r = p.evaluate('sin(30)');
            this.assert(r.success);
            this.assertAlmostEqual(r.value, 0.5);
        });
        
        this.test('sin(90°) = 1', () => {
            const r = p.evaluate('sin(90)');
            this.assert(r.success);
            this.assertAlmostEqual(r.value, 1);
        });
        
        this.test('cos(0°) = 1', () => {
            const r = p.evaluate('cos(0)');
            this.assert(r.success);
            this.assertAlmostEqual(r.value, 1);
        });
        
        this.test('cos(60°) = 0.5', () => {
            const r = p.evaluate('cos(60)');
            this.assert(r.success);
            this.assertAlmostEqual(r.value, 0.5);
        });
        
        this.test('tan(45°) = 1', () => {
            const r = p.evaluate('tan(45)');
            this.assert(r.success);
            this.assertAlmostEqual(r.value, 1);
        });
        
        // === INVERSE TRIGONOMETRIC ===
        this.test('asin(0.5) = 30°', () => {
            const r = p.evaluate('asin(0.5)');
            this.assert(r.success);
            this.assertAlmostEqual(r.value, 30);
        });
        
        this.test('acos(0.5) = 60°', () => {
            const r = p.evaluate('acos(0.5)');
            this.assert(r.success);
            this.assertAlmostEqual(r.value, 60);
        });
        
        this.test('atan(1) = 45°', () => {
            const r = p.evaluate('atan(1)');
            this.assert(r.success);
            this.assertAlmostEqual(r.value, 45);
        });
        
        // === LOGARITHMS ===
        this.test('log(10) = 1', () => {
            const r = p.evaluate('log(10)');
            this.assert(r.success);
            this.assertEqual(r.value, 1);
        });
        
        this.test('log(100) = 2', () => {
            const r = p.evaluate('log(100)');
            this.assert(r.success);
            this.assertEqual(r.value, 2);
        });
        
        this.test('ln(e) = 1', () => {
            const r = p.evaluate('ln(e)');
            this.assert(r.success);
            this.assertAlmostEqual(r.value, 1);
        });
        
        this.test('ln(1) = 0', () => {
            const r = p.evaluate('ln(1)');
            this.assert(r.success);
            this.assertEqual(r.value, 0);
        });
        
        this.test('log2(8) = 3', () => {
            const r = p.evaluate('log2(8)');
            this.assert(r.success);
            this.assertEqual(r.value, 3);
        });
        
        // === ROOTS ===
        this.test('sqrt(4) = 2', () => {
            const r = p.evaluate('sqrt(4)');
            this.assert(r.success);
            this.assertEqual(r.value, 2);
        });
        
        this.test('sqrt(144) = 12', () => {
            const r = p.evaluate('sqrt(144)');
            this.assert(r.success);
            this.assertEqual(r.value, 12);
        });
        
        this.test('cbrt(27) = 3', () => {
            const r = p.evaluate('cbrt(27)');
            this.assert(r.success);
            this.assertEqual(r.value, 3);
        });
        
        this.test('cbrt(-8) = -2', () => {
            const r = p.evaluate('cbrt(-8)');
            this.assert(r.success);
            this.assertEqual(r.value, -2);
        });
        
        // === FACTORIAL ===
        this.test('fact(0) = 1', () => {
            const r = p.evaluate('fact(0)');
            this.assert(r.success);
            this.assertEqual(r.value, 1);
        });
        
        this.test('fact(5) = 120', () => {
            const r = p.evaluate('fact(5)');
            this.assert(r.success);
            this.assertEqual(r.value, 120);
        });
        
        this.test('5! = 120', () => {
            const r = p.evaluate('5!');
            this.assert(r.success);
            this.assertEqual(r.value, 120);
        });
        
        this.test('fact(10) = 3628800', () => {
            const r = p.evaluate('fact(10)');
            this.assert(r.success);
            this.assertEqual(r.value, 3628800);
        });
        
        // === OTHER FUNCTIONS ===
        this.test('abs(-42) = 42', () => {
            const r = p.evaluate('abs(-42)');
            this.assert(r.success);
            this.assertEqual(r.value, 42);
        });
        
        this.test('floor(3.7) = 3', () => {
            const r = p.evaluate('floor(3.7)');
            this.assert(r.success);
            this.assertEqual(r.value, 3);
        });
        
        this.test('ceil(3.2) = 4', () => {
            const r = p.evaluate('ceil(3.2)');
            this.assert(r.success);
            this.assertEqual(r.value, 4);
        });
        
        this.test('round(3.5) = 4', () => {
            const r = p.evaluate('round(3.5)');
            this.assert(r.success);
            this.assertEqual(r.value, 4);
        });
        
        this.test('max(3, 7) = 7', () => {
            const r = p.evaluate('max(3, 7)');
            this.assert(r.success);
            this.assertEqual(r.value, 7);
        });
        
        this.test('min(3, 7) = 3', () => {
            const r = p.evaluate('min(3, 7)');
            this.assert(r.success);
            this.assertEqual(r.value, 3);
        });
        
        this.test('gcd(12, 18) = 6', () => {
            const r = p.evaluate('gcd(12, 18)');
            this.assert(r.success);
            this.assertEqual(r.value, 6);
        });
        
        this.test('lcm(4, 6) = 12', () => {
            const r = p.evaluate('lcm(4, 6)');
            this.assert(r.success);
            this.assertEqual(r.value, 12);
        });
        
        // === COMPLEX EXPRESSIONS ===
        this.test('Complex: sqrt(3^2 + 4^2) = 5', () => {
            const r = p.evaluate('sqrt(3^2 + 4^2)');
            this.assert(r.success);
            this.assertEqual(r.value, 5);
        });
        
        this.test('Complex: 2 + 3 * sin(30) = 3.5', () => {
            const r = p.evaluate('2 + 3 * sin(30)');
            this.assert(r.success);
            this.assertAlmostEqual(r.value, 3.5);
        });
        
        this.test('Pythagorean identity: sin²(30) + cos²(30) = 1', () => {
            const r = p.evaluate('(sin(30))^2 + (cos(30))^2');
            this.assert(r.success);
            this.assertAlmostEqual(r.value, 1);
        });
        
        // === IMPLICIT MULTIPLICATION ===
        this.test('Implicit: 2pi ≈ 6.28', () => {
            const r = p.evaluate('2pi');
            this.assert(r.success);
            this.assertAlmostEqual(r.value, 2 * Math.PI);
        });
        
        this.test('Implicit: 2(3+4) = 14', () => {
            const r = p.evaluate('2(3+4)');
            this.assert(r.success);
            this.assertEqual(r.value, 14);
        });
        
        // === SCIENTIFIC NOTATION ===
        this.test('Scientific: 1.5e3 = 1500', () => {
            const r = p.evaluate('1.5e3');
            this.assert(r.success);
            this.assertEqual(r.value, 1500);
        });
        
        this.test('Scientific: 2e-2 = 0.02', () => {
            const r = p.evaluate('2e-2');
            this.assert(r.success);
            this.assertEqual(r.value, 0.02);
        });
        
        // === ERROR CASES ===
        this.test('Error: Division by zero', () => {
            const r = p.evaluate('5 / 0');
            this.assert(!r.success);
        });
        
        this.test('Error: sqrt(-1)', () => {
            const r = p.evaluate('sqrt(-1)');
            this.assert(!r.success);
        });
        
        this.test('Error: log(0)', () => {
            const r = p.evaluate('log(0)');
            this.assert(!r.success);
        });
        
        this.test('Error: log(-5)', () => {
            const r = p.evaluate('log(-5)');
            this.assert(!r.success);
        });
        
        this.test('Error: asin(2)', () => {
            const r = p.evaluate('asin(2)');
            this.assert(!r.success);
        });
        
        this.test('Error: fact(-1)', () => {
            const r = p.evaluate('fact(-1)');
            this.assert(!r.success);
        });
        
        this.test('Error: Unbalanced parentheses (open)', () => {
            const r = p.evaluate('(2 + 3');
            this.assert(!r.success);
        });
        
        this.test('Error: Empty expression', () => {
            const r = p.evaluate('');
            this.assert(!r.success);
        });
        
        this.test('Error: Unknown function', () => {
            const r = p.evaluate('unknown(5)');
            this.assert(!r.success);
        });
        
        // === RADIAN MODE ===
        this.test('Radian mode: sin(π/2) = 1', () => {
            p.setDegreeMode(false);
            const r = p.evaluate('sin(pi/2)');
            p.setDegreeMode(true);
            this.assert(r.success);
            this.assertAlmostEqual(r.value, 1);
        });
        
        this.test('Radian mode: cos(π) = -1', () => {
            p.setDegreeMode(false);
            const r = p.evaluate('cos(pi)');
            p.setDegreeMode(true);
            this.assert(r.success);
            this.assertAlmostEqual(r.value, -1);
        });
        
        // === ERROR HANDLER ===
        this.test('ErrorHandler: Get error details', () => {
            const details = eh.getErrorDetails('DIVISION_BY_ZERO');
            this.assert(details.title.length > 0);
            this.assert(details.message.length > 0);
            this.assertEqual(details.severity, 'error');
        });
        
        this.test('ErrorHandler: Validate balanced expression', () => {
            const result = eh.validateExpression('(2 + 3) * 4');
            this.assert(result.valid);
        });
        
        this.test('ErrorHandler: Detect unbalanced parentheses', () => {
            const result = eh.validateExpression('(2 + 3 * 4');
            this.assert(!result.valid);
        });
        
        this.test('ErrorHandler: Validate NaN result', () => {
            const result = eh.validateResult(NaN);
            this.assert(!result.valid);
            this.assertEqual(result.error, 'NAN_RESULT');
        });
        
        this.test('ErrorHandler: Validate Infinity result', () => {
            const result = eh.validateResult(Infinity);
            this.assert(result.valid);
            this.assertEqual(result.warning, 'INFINITY_RESULT');
        });
    }
}

// Run tests
const runner = new TestRunner();
runner.setupTests();
runner.run().then(success => {
    process.exit(success ? 0 : 1);
});
