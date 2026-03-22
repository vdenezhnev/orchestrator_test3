# API Documentation

Подробная документация по API модулей инженерного калькулятора.

## Содержание

- [ExpressionParser](#expressionparser)
- [ErrorHandler](#errorhandler)
- [CalculatorModel](#calculatormodel)
- [DisplayView](#displayview)
- [UIController](#uicontroller)
- [Calculator](#calculator)

---

## ExpressionParser

Парсер и вычислитель математических выражений с использованием алгоритма сортировочной станции (Shunting-yard).

### Импорт

```javascript
import { ExpressionParser } from './js/ExpressionParser.js';
```

### Конструктор

```javascript
const parser = new ExpressionParser(options);
```

| Параметр | Тип | По умолчанию | Описание |
|----------|-----|--------------|----------|
| `options.isDegreeMode` | `boolean` | `true` | Использовать градусы для триг. функций |

### Методы

#### evaluate(expression)

Вычисляет математическое выражение.

```javascript
const result = parser.evaluate('2 + 3 * sin(30)');
// { success: true, value: 3.5 }

const error = parser.evaluate('5 / 0');
// { success: false, error: 'Деление на ноль' }
```

| Параметр | Тип | Описание |
|----------|-----|----------|
| `expression` | `string` | Математическое выражение |

**Возвращает**: `{ success: boolean, value?: number, error?: string }`

#### validate(expression)

Проверяет синтаксис выражения без вычисления.

```javascript
const validation = parser.validate('(2 + 3');
// { valid: false, error: 'Несбалансированные скобки' }
```

#### setDegreeMode(isDegree)

Переключает режим градусы/радианы.

```javascript
parser.setDegreeMode(false); // Радианы
parser.setDegreeMode(true);  // Градусы
```

#### getSupportedFunctions()

Возвращает список поддерживаемых функций.

```javascript
const functions = parser.getSupportedFunctions();
// ['sin', 'cos', 'tan', 'log', 'ln', 'sqrt', ...]
```

#### getSupportedConstants()

Возвращает словарь констант.

```javascript
const constants = parser.getSupportedConstants();
// { π: 3.14159..., e: 2.71828..., φ: 1.61803... }
```

### Поддерживаемые операторы

| Оператор | Приоритет | Ассоциативность | Описание |
|----------|-----------|-----------------|----------|
| `+` | 2 | Левая | Сложение |
| `-` | 2 | Левая | Вычитание |
| `*`, `×` | 3 | Левая | Умножение |
| `/`, `÷` | 3 | Левая | Деление |
| `%` | 3 | Левая | Остаток |
| `^`, `**` | 4 | Правая | Степень |

### Поддерживаемые функции

| Категория | Функции |
|-----------|---------|
| Тригонометрия | `sin`, `cos`, `tan`, `cot`, `sec`, `csc` |
| Обратная триг. | `asin`, `acos`, `atan`, `atan2` |
| Гиперболические | `sinh`, `cosh`, `tanh`, `asinh`, `acosh`, `atanh` |
| Логарифмы | `log`, `log2`, `log10`, `ln`, `logb` |
| Степени/корни | `exp`, `pow`, `sqrt`, `cbrt`, `nroot` |
| Округление | `floor`, `ceil`, `round`, `trunc`, `frac` |
| Специальные | `abs`, `sign`, `fact` (n!), `gcd`, `lcm`, `min`, `max`, `mod` |
| Преобразование | `deg`, `rad` |

---

## ErrorHandler

Централизованная обработка ошибок и валидация.

### Импорт

```javascript
import { ErrorHandler } from './js/ErrorHandler.js';
```

### Конструктор

```javascript
const handler = new ErrorHandler();
```

### Методы

#### getErrorDetails(errorCode)

Получает детали ошибки по коду.

```javascript
const details = handler.getErrorDetails('DIVISION_BY_ZERO');
// {
//   title: 'Деление на ноль',
//   message: 'Невозможно разделить на ноль',
//   icon: '÷',
//   severity: 'error'
// }
```

#### validateExpression(expression)

Проверяет синтаксис выражения.

```javascript
const result = handler.validateExpression('(2 + 3 * 4');
// {
//   valid: false,
//   errors: [{ code: 'UNBALANCED_PARENTHESES', position: 10 }]
// }
```

#### validateResult(result)

Проверяет результат вычисления.

```javascript
handler.validateResult(42);      // { valid: true }
handler.validateResult(NaN);     // { valid: false, error: 'NAN_RESULT' }
handler.validateResult(Infinity); // { valid: true, warning: 'INFINITY_RESULT', value: '∞' }
```

#### formatError(errorCode)

Форматирует ошибку для отображения.

```javascript
const message = handler.formatError('SQRT_NEGATIVE');
// 'Квадратный корень определён только для неотрицательных чисел'
```

#### getSeverity(errorCode)

Возвращает уровень серьёзности ошибки.

```javascript
handler.getSeverity('DIVISION_BY_ZERO');  // 'error'
handler.getSeverity('MAX_DIGITS_REACHED'); // 'warning'
```

### Коды ошибок

| Код | Тип | Описание |
|-----|-----|----------|
| `DIVISION_BY_ZERO` | error | Деление на ноль |
| `SQRT_NEGATIVE` | error | Корень отрицательного числа |
| `LOG_NON_POSITIVE` | error | Логарифм неположительного числа |
| `ASIN_OUT_OF_RANGE` | error | Аргумент asin вне [-1, 1] |
| `ACOS_OUT_OF_RANGE` | error | Аргумент acos вне [-1, 1] |
| `TAN_UNDEFINED` | error | Тангенс не определён |
| `FACTORIAL_INVALID` | error | Факториал нецелого/отрицательного |
| `UNBALANCED_PARENTHESES` | error | Несбалансированные скобки |
| `MISSING_OPERAND` | error | Отсутствует операнд |
| `TOO_MANY_DECIMALS` | error | Несколько десятичных точек |
| `MAX_DIGITS_REACHED` | warning | Достигнут лимит цифр (15) |
| `INFINITY_RESULT` | warning | Результат — бесконечность |

---

## CalculatorModel

Модель калькулятора — состояние и бизнес-логика.

### Импорт

```javascript
import { CalculatorModel } from './js/CalculatorModel.js';
```

### Конструктор

```javascript
const model = new CalculatorModel();
```

### Методы ввода

#### inputDigit(digit)

```javascript
model.inputDigit('5');
model.inputDigit('0');
```

#### inputOperator(operator)

```javascript
model.inputOperator('+');
model.inputOperator('×');
```

#### inputDecimal()

```javascript
model.inputDecimal();
```

#### inputParenthesis(paren)

```javascript
model.inputParenthesis('(');
model.inputParenthesis(')');
```

#### inputFunction(funcName)

```javascript
model.inputFunction('sin');
model.inputFunction('sqrt');
```

#### inputConstantExpr(constant)

```javascript
model.inputConstantExpr('π');
model.inputConstantExpr('e');
```

### Методы управления

#### calculate()

Вычисляет текущее выражение.

```javascript
const result = model.calculate();
// { value: 42, expression: '6 × 7' }
```

#### reset()

Сбрасывает в начальное состояние.

#### clear()

Очищает текущий ввод.

#### backspace()

Удаляет последний символ.

#### toggleSign()

Меняет знак числа.

### Работа с памятью

```javascript
model.memoryStore();      // MS — сохранить
model.memoryRecall();     // MR — вызвать
model.memoryAdd();        // M+ — добавить
model.memorySubtract();   // M- — вычесть
model.memoryClear();      // MC — очистить
```

### История

```javascript
const history = model.getHistory();
// [{ expression: '2+3', result: 5, timestamp: 1234567890 }, ...]

model.clearHistory();
```

### Режимы

```javascript
model.setAngleMode('RAD');  // или 'DEG'
model.setExpressionMode(true);  // Полный парсинг выражений
model.toggleSecondMode();   // Переключить 2nd функции
```

### Состояние

```javascript
const state = model.getDisplayState();
// {
//   currentValue: '123.456',
//   expression: 'sin(30) + ...',
//   hasMemory: true,
//   angleMode: 'DEG',
//   isSecondMode: false,
//   openParentheses: 0
// }

// Сохранение/восстановление
const exported = model.exportState();
model.importState(exported);
```

---

## DisplayView

Представление — управление UI.

### Импорт

```javascript
import { DisplayView } from './js/DisplayView.js';
```

### Методы отображения

```javascript
view.updateDisplay('123.456');
view.updateExpression('sin(30) + cos(60)');
view.updateHistory(historyArray);
```

### Темы

```javascript
view.setTheme('dark');     // 'light', 'dark', 'high-contrast'
view.toggleTheme();        // Циклическое переключение
```

### Индикаторы

```javascript
view.showMemoryIndicator();
view.hideMemoryIndicator();
view.showAngleMode('RAD');
view.showParenthesesIndicator(2);  // 2 открытых скобки
```

### Обратная связь

```javascript
view.showError('DIVISION_BY_ZERO');
view.showWarning('MAX_DIGITS_REACHED');
view.clearError();
view.flashKey('sin');           // Подсветка кнопки
view.highlightOperator('+');    // Выделить оператор
view.clearOperatorHighlight();
view.showFunctionFeedback('sqrt', 144, 12);
```

### История

```javascript
view.toggleHistory();
view.addHistoryItem({ expression: '2+2', result: 4 });
view.clearHistoryUI();
```

### Доступность

```javascript
view.announceForScreenReader('Результат: 42');
```

---

## UIController

Контроллер — обработка пользовательского ввода.

### Импорт

```javascript
import { UIController } from './js/UIController.js';
```

### Конструктор

```javascript
const controller = new UIController(model, view);
```

### Программный ввод

```javascript
controller.handleDigitInput('5');
controller.handleOperatorInput('+');
controller.handleFunctionInput('sin');
controller.handleConstantInput('π');
controller.handleActionInput('calculate');
controller.handleModeChange('RAD');
```

### Горячие клавиши

| Клавиша | Действие |
|---------|----------|
| `0-9` | Цифры |
| `.` `,` | Десятичная точка |
| `+ - * /` | Операторы |
| `^` | Степень |
| `%` | Остаток |
| `( )` | Скобки |
| `Enter` `=` | Вычислить |
| `Escape` | Очистить |
| `Backspace` | Удалить символ |
| `Delete` | Полная очистка |
| `p` | π |
| `e` | e |
| `s` `c` `t` | sin, cos, tan |
| `l` `n` | log, ln |
| `r` | √ (корень) |
| `!` | Факториал |
| `m` | DEG/RAD |
| `h` | История |

---

## Calculator

Главный класс приложения — координатор MVC.

### Импорт

```javascript
import { Calculator } from './js/Calculator.js';
```

### Автоматическая инициализация

```javascript
// При загрузке страницы создаётся window.calculator
window.calculator.getValue();
window.calculator.setValue('42');
```

### Методы

```javascript
const calc = new Calculator();

calc.getValue();           // Получить текущее значение
calc.setValue('123');      // Установить значение
calc.evaluate();           // Вычислить
calc.reset();              // Полный сброс
calc.destroy();            // Уничтожить экземпляр
```

---

## Примеры использования

### Базовый калькулятор

```javascript
import { ExpressionParser } from './js/ExpressionParser.js';

const parser = new ExpressionParser();

// Простые вычисления
console.log(parser.evaluate('2 + 2').value);        // 4
console.log(parser.evaluate('10 / 3').value);       // 3.333...
console.log(parser.evaluate('2 ^ 10').value);       // 1024

// Тригонометрия
console.log(parser.evaluate('sin(30)').value);      // 0.5
console.log(parser.evaluate('cos(60)').value);      // 0.5

// Сложные выражения
console.log(parser.evaluate('sqrt(3^2 + 4^2)').value);  // 5
console.log(parser.evaluate('2pi').value);              // 6.283...
```

### Обработка ошибок

```javascript
import { ExpressionParser } from './js/ExpressionParser.js';
import { ErrorHandler } from './js/ErrorHandler.js';

const parser = new ExpressionParser();
const handler = new ErrorHandler();

const result = parser.evaluate('sqrt(-1)');

if (!result.success) {
    const details = handler.getErrorDetails(result.error);
    console.log(`Ошибка: ${details.title}`);
    console.log(`Описание: ${details.message}`);
}
```

### Интеграция с UI

```javascript
import { CalculatorModel } from './js/CalculatorModel.js';
import { DisplayView } from './js/DisplayView.js';
import { UIController } from './js/UIController.js';

const model = new CalculatorModel();
const view = new DisplayView();
const controller = new UIController(model, view);

// Теперь UI полностью функционален
// Клики, клавиатура, тач-события обрабатываются автоматически
```
