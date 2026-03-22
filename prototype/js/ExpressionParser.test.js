/**
 * ExpressionParser Tests
 * Run with: node --experimental-vm-modules ExpressionParser.test.js
 * Or open test.html in browser
 */

import { ExpressionParser } from './ExpressionParser.js';

class TestRunner {
    constructor() {
        this.passed = 0;
        this.failed = 0;
        this.results = [];
    }
    
    test(name, fn) {
        try {
            fn();
            this.passed++;
            this.results.push({ name, status: 'PASS' });
            console.log(`✓ ${name}`);
        } catch (e) {
            this.failed++;
            this.results.push({ name, status: 'FAIL', error: e.message });
            console.log(`✗ ${name}: ${e.message}`);
        }
    }
    
    assertEqual(actual, expected, message = '') {
        if (actual !== expected) {
            throw new Error(`${message} Expected ${expected}, got ${actual}`);
        }
    }
    
    assertAlmostEqual(actual, expected, tolerance = 1e-10, message = '') {
        if (Math.abs(actual - expected) > tolerance) {
            throw new Error(`${message} Expected ~${expected}, got ${actual}`);
        }
    }
    
    assertTrue(condition, message = '') {
        if (!condition) {
            throw new Error(message || 'Expected true');
        }
    }
    
    summary() {
        console.log(`\n${'='.repeat(40)}`);
        console.log(`Tests: ${this.passed + this.failed}, Passed: ${this.passed}, Failed: ${this.failed}`);
        return this.failed === 0;
    }
}

const runner = new TestRunner();
const parser = new ExpressionParser({ isDegreeMode: true });

console.log('ExpressionParser Tests\n' + '='.repeat(40));

runner.test('Basic addition', () => {
    const result = parser.evaluate('2 + 3');
    runner.assertTrue(result.success);
    runner.assertEqual(result.value, 5);
});

runner.test('Basic subtraction', () => {
    const result = parser.evaluate('10 - 4');
    runner.assertTrue(result.success);
    runner.assertEqual(result.value, 6);
});

runner.test('Basic multiplication', () => {
    const result = parser.evaluate('6 * 7');
    runner.assertTrue(result.success);
    runner.assertEqual(result.value, 42);
});

runner.test('Basic division', () => {
    const result = parser.evaluate('20 / 4');
    runner.assertTrue(result.success);
    runner.assertEqual(result.value, 5);
});

runner.test('Division by zero', () => {
    const result = parser.evaluate('5 / 0');
    runner.assertTrue(!result.success);
    runner.assertTrue(result.error.includes('ноль'));
});

runner.test('Operator precedence: 2 + 3 * 4 = 14', () => {
    const result = parser.evaluate('2 + 3 * 4');
    runner.assertTrue(result.success);
    runner.assertEqual(result.value, 14);
});

runner.test('Operator precedence: 10 - 6 / 2 = 7', () => {
    const result = parser.evaluate('10 - 6 / 2');
    runner.assertTrue(result.success);
    runner.assertEqual(result.value, 7);
});

runner.test('Parentheses: (2 + 3) * 4 = 20', () => {
    const result = parser.evaluate('(2 + 3) * 4');
    runner.assertTrue(result.success);
    runner.assertEqual(result.value, 20);
});

runner.test('Nested parentheses: ((2 + 3) * (4 - 1)) = 15', () => {
    const result = parser.evaluate('((2 + 3) * (4 - 1))');
    runner.assertTrue(result.success);
    runner.assertEqual(result.value, 15);
});

runner.test('Unary minus: -5 + 3 = -2', () => {
    const result = parser.evaluate('-5 + 3');
    runner.assertTrue(result.success);
    runner.assertEqual(result.value, -2);
});

runner.test('Unary minus in expression: 10 * -2 = -20', () => {
    const result = parser.evaluate('10 * -2');
    runner.assertTrue(result.success);
    runner.assertEqual(result.value, -20);
});

runner.test('Power: 2 ^ 10 = 1024', () => {
    const result = parser.evaluate('2 ^ 10');
    runner.assertTrue(result.success);
    runner.assertEqual(result.value, 1024);
});

runner.test('Power right associativity: 2 ^ 3 ^ 2 = 512', () => {
    const result = parser.evaluate('2 ^ 3 ^ 2');
    runner.assertTrue(result.success);
    runner.assertEqual(result.value, 512);
});

runner.test('Constant pi', () => {
    const result = parser.evaluate('pi');
    runner.assertTrue(result.success);
    runner.assertAlmostEqual(result.value, Math.PI);
});

runner.test('Constant e', () => {
    const result = parser.evaluate('e');
    runner.assertTrue(result.success);
    runner.assertAlmostEqual(result.value, Math.E);
});

runner.test('Constant π (unicode)', () => {
    const result = parser.evaluate('π');
    runner.assertTrue(result.success);
    runner.assertAlmostEqual(result.value, Math.PI);
});

runner.test('sin(0) in degrees = 0', () => {
    const result = parser.evaluate('sin(0)');
    runner.assertTrue(result.success);
    runner.assertAlmostEqual(result.value, 0);
});

runner.test('sin(90) in degrees = 1', () => {
    const result = parser.evaluate('sin(90)');
    runner.assertTrue(result.success);
    runner.assertAlmostEqual(result.value, 1);
});

runner.test('cos(0) in degrees = 1', () => {
    const result = parser.evaluate('cos(0)');
    runner.assertTrue(result.success);
    runner.assertAlmostEqual(result.value, 1);
});

runner.test('cos(60) in degrees = 0.5', () => {
    const result = parser.evaluate('cos(60)');
    runner.assertTrue(result.success);
    runner.assertAlmostEqual(result.value, 0.5);
});

runner.test('tan(45) in degrees = 1', () => {
    const result = parser.evaluate('tan(45)');
    runner.assertTrue(result.success);
    runner.assertAlmostEqual(result.value, 1);
});

runner.test('asin(1) in degrees = 90', () => {
    const result = parser.evaluate('asin(1)');
    runner.assertTrue(result.success);
    runner.assertAlmostEqual(result.value, 90);
});

runner.test('acos(0.5) in degrees = 60', () => {
    const result = parser.evaluate('acos(0.5)');
    runner.assertTrue(result.success);
    runner.assertAlmostEqual(result.value, 60);
});

runner.test('log(100) = 2', () => {
    const result = parser.evaluate('log(100)');
    runner.assertTrue(result.success);
    runner.assertEqual(result.value, 2);
});

runner.test('ln(e) = 1', () => {
    const result = parser.evaluate('ln(e)');
    runner.assertTrue(result.success);
    runner.assertAlmostEqual(result.value, 1);
});

runner.test('log of negative number', () => {
    const result = parser.evaluate('log(-5)');
    runner.assertTrue(!result.success);
});

runner.test('sqrt(16) = 4', () => {
    const result = parser.evaluate('sqrt(16)');
    runner.assertTrue(result.success);
    runner.assertEqual(result.value, 4);
});

runner.test('sqrt(2) ≈ 1.414', () => {
    const result = parser.evaluate('sqrt(2)');
    runner.assertTrue(result.success);
    runner.assertAlmostEqual(result.value, Math.SQRT2);
});

runner.test('cbrt(27) = 3', () => {
    const result = parser.evaluate('cbrt(27)');
    runner.assertTrue(result.success);
    runner.assertEqual(result.value, 3);
});

runner.test('cbrt(-8) = -2', () => {
    const result = parser.evaluate('cbrt(-8)');
    runner.assertTrue(result.success);
    runner.assertEqual(result.value, -2);
});

runner.test('abs(-42) = 42', () => {
    const result = parser.evaluate('abs(-42)');
    runner.assertTrue(result.success);
    runner.assertEqual(result.value, 42);
});

runner.test('factorial: fact(5) = 120', () => {
    const result = parser.evaluate('fact(5)');
    runner.assertTrue(result.success);
    runner.assertEqual(result.value, 120);
});

runner.test('factorial: 5! = 120', () => {
    const result = parser.evaluate('5!');
    runner.assertTrue(result.success);
    runner.assertEqual(result.value, 120);
});

runner.test('exp(1) = e', () => {
    const result = parser.evaluate('exp(1)');
    runner.assertTrue(result.success);
    runner.assertAlmostEqual(result.value, Math.E);
});

runner.test('pow(2, 8) = 256', () => {
    const result = parser.evaluate('pow(2, 8)');
    runner.assertTrue(result.success);
    runner.assertEqual(result.value, 256);
});

runner.test('max(3, 7) = 7', () => {
    const result = parser.evaluate('max(3, 7)');
    runner.assertTrue(result.success);
    runner.assertEqual(result.value, 7);
});

runner.test('min(3, 7) = 3', () => {
    const result = parser.evaluate('min(3, 7)');
    runner.assertTrue(result.success);
    runner.assertEqual(result.value, 3);
});

runner.test('Complex expression: 2 + 3 * sin(30) = 3.5', () => {
    const result = parser.evaluate('2 + 3 * sin(30)');
    runner.assertTrue(result.success);
    runner.assertAlmostEqual(result.value, 3.5);
});

runner.test('Complex expression: sqrt(3^2 + 4^2) = 5', () => {
    const result = parser.evaluate('sqrt(3^2 + 4^2)');
    runner.assertTrue(result.success);
    runner.assertEqual(result.value, 5);
});

runner.test('Implicit multiplication: 2pi ≈ 6.28', () => {
    const result = parser.evaluate('2pi');
    runner.assertTrue(result.success);
    runner.assertAlmostEqual(result.value, 2 * Math.PI);
});

runner.test('Implicit multiplication: 2(3+4) = 14', () => {
    const result = parser.evaluate('2(3+4)');
    runner.assertTrue(result.success);
    runner.assertEqual(result.value, 14);
});

runner.test('Scientific notation: 1.5e3 = 1500', () => {
    const result = parser.evaluate('1.5e3');
    runner.assertTrue(result.success);
    runner.assertEqual(result.value, 1500);
});

runner.test('Scientific notation negative: 2e-2 = 0.02', () => {
    const result = parser.evaluate('2e-2');
    runner.assertTrue(result.success);
    runner.assertEqual(result.value, 0.02);
});

runner.test('Unbalanced parentheses error', () => {
    const result = parser.evaluate('(2 + 3');
    runner.assertTrue(!result.success);
    runner.assertTrue(result.error.includes('скобки'));
});

runner.test('Unknown function error', () => {
    const result = parser.evaluate('unknown(5)');
    runner.assertTrue(!result.success);
});

runner.test('Empty expression', () => {
    const result = parser.evaluate('');
    runner.assertTrue(!result.success);
});

runner.test('floor(3.7) = 3', () => {
    const result = parser.evaluate('floor(3.7)');
    runner.assertTrue(result.success);
    runner.assertEqual(result.value, 3);
});

runner.test('ceil(3.2) = 4', () => {
    const result = parser.evaluate('ceil(3.2)');
    runner.assertTrue(result.success);
    runner.assertEqual(result.value, 4);
});

runner.test('round(3.5) = 4', () => {
    const result = parser.evaluate('round(3.5)');
    runner.assertTrue(result.success);
    runner.assertEqual(result.value, 4);
});

runner.test('gcd(12, 18) = 6', () => {
    const result = parser.evaluate('gcd(12, 18)');
    runner.assertTrue(result.success);
    runner.assertEqual(result.value, 6);
});

runner.test('lcm(4, 6) = 12', () => {
    const result = parser.evaluate('lcm(4, 6)');
    runner.assertTrue(result.success);
    runner.assertEqual(result.value, 12);
});

runner.test('Radian mode: sin(π/2) = 1', () => {
    parser.setDegreeMode(false);
    const result = parser.evaluate('sin(pi/2)');
    parser.setDegreeMode(true);
    runner.assertTrue(result.success);
    runner.assertAlmostEqual(result.value, 1);
});

runner.test('Hyperbolic: sinh(0) = 0', () => {
    const result = parser.evaluate('sinh(0)');
    runner.assertTrue(result.success);
    runner.assertEqual(result.value, 0);
});

runner.test('Hyperbolic: cosh(0) = 1', () => {
    const result = parser.evaluate('cosh(0)');
    runner.assertTrue(result.success);
    runner.assertEqual(result.value, 1);
});

runner.test('mod(17, 5) = 2', () => {
    const result = parser.evaluate('mod(17, 5)');
    runner.assertTrue(result.success);
    runner.assertEqual(result.value, 2);
});

runner.test('nroot(27, 3) = 3', () => {
    const result = parser.evaluate('nroot(27, 3)');
    runner.assertTrue(result.success);
    runner.assertEqual(result.value, 3);
});

runner.test('Long expression: 1+2+3+4+5+6+7+8+9+10 = 55', () => {
    const result = parser.evaluate('1+2+3+4+5+6+7+8+9+10');
    runner.assertTrue(result.success);
    runner.assertEqual(result.value, 55);
});

const success = runner.summary();
if (typeof process !== 'undefined') {
    process.exit(success ? 0 : 1);
}
