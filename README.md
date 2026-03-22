# 🧮 Инженерный калькулятор

Веб-приложение инженерного калькулятора с поддержкой 40+ научных функций, адаптивным дизайном и полной доступностью.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Tests](https://img.shields.io/badge/tests-68%20passed-brightgreen)

## ✨ Возможности

### Базовые операции
- Сложение, вычитание, умножение, деление
- Процент и остаток от деления
- Приоритет операторов и скобки
- Унарные операторы (+/-)

### Инженерные функции

| Категория | Функции |
|-----------|---------|
| **Тригонометрия** | sin, cos, tan, cot, sec, csc |
| **Обратная тригонометрия** | asin, acos, atan, atan2 |
| **Гиперболические** | sinh, cosh, tanh, asinh, acosh, atanh |
| **Логарифмы** | log, log2, log10, ln, logb |
| **Степени и корни** | pow, sqrt, cbrt, nroot, exp |
| **Специальные** | abs, floor, ceil, round, trunc, frac, sign |
| **Комбинаторика** | fact (n!), gcd, lcm |
| **Утилиты** | min, max, mod, deg, rad |

### Константы
- `π` (pi) — число Пи
- `e` — число Эйлера
- `φ` (phi) — золотое сечение

### Дополнительные возможности
- 🔄 Переключение градусы/радианы (DEG/RAD)
- 💾 Функции памяти (MC, MR, M+, M-, MS)
- 📜 История вычислений
- 🌓 Три темы оформления (светлая/тёмная/высококонтрастная)
- ⌨️ Полная поддержка клавиатуры
- 📱 Адаптивный дизайн для мобильных устройств
- ♿ Доступность (ARIA, скринридеры)

## 🚀 Быстрый старт

### Вариант 1: Открыть напрямую
```bash
# Просто откройте файл в браузере
open prototype/index.html
# или
xdg-open prototype/index.html  # Linux
start prototype/index.html     # Windows
```

### Вариант 2: Локальный сервер (рекомендуется для ES6 модулей)
```bash
cd prototype
python3 -m http.server 8080
# Откройте http://localhost:8080
```

### Вариант 3: Node.js сервер
```bash
cd prototype
npx serve .
# Откройте указанный URL
```

## 📁 Структура проекта

```
/
├── docs/                           # Документация
│   ├── requirements.md             # Функциональные требования
│   ├── engineering-functions.md    # Описание всех функций
│   └── wireframes/
│       ├── wireframe-description.md   # Макеты интерфейса
│       └── style-guide.md             # Руководство по стилю
│
├── prototype/                      # Исходный код
│   ├── index.html                  # Главная страница
│   ├── styles.css                  # Стили и темы
│   ├── script.js                   # Legacy-версия (без ES6 модулей)
│   │
│   ├── js/                         # ES6 модули
│   │   ├── Calculator.js           # Точка входа, координация MVC
│   │   ├── CalculatorModel.js      # Модель: состояние и логика
│   │   ├── DisplayView.js          # Представление: отображение
│   │   ├── UIController.js         # Контроллер: обработка событий
│   │   ├── ExpressionParser.js     # Парсер математических выражений
│   │   └── ErrorHandler.js         # Обработка и валидация ошибок
│   │
│   └── tests/                      # Тесты
│       ├── run-tests.mjs           # Node.js тестовый раннер
│       ├── test-runner.html        # Браузерные тесты с UI
│       ├── performance-benchmarks.html  # Бенчмарки
│       └── requirements-compliance.html # Чеклист требований
│
└── README.md                       # Этот файл
```

## 🏗️ Архитектура

Приложение построено на паттерне **MVC** (Model-View-Controller):

```
┌─────────────────────────────────────────────────────────────┐
│                      Calculator.js                          │
│                   (Координатор MVC)                         │
└────────────┬──────────────┬──────────────┬──────────────────┘
             │              │              │
             ▼              ▼              ▼
┌────────────────┐  ┌──────────────┐  ┌───────────────────┐
│CalculatorModel│  │ DisplayView  │  │  UIController     │
│                │  │              │  │                   │
│ • Состояние    │  │ • Дисплей    │  │ • Клики           │
│ • Вычисления   │  │ • Темы       │  │ • Клавиатура      │
│ • Память       │  │ • История    │  │ • Тач-события     │
│ • История      │  │ • Индикаторы │  │ • Валидация       │
└───────┬────────┘  └──────────────┘  └───────────────────┘
        │
        ▼
┌────────────────┐  ┌──────────────┐
│ExpressionParser│  │ ErrorHandler │
│                │  │              │
│ • Токенизация  │  │ • Валидация  │
│ • Shunting-yard│  │ • Сообщения  │
│ • Вычисление   │  │ • Блокировка │
└────────────────┘  └──────────────┘
```

## 📖 API модулей

### ExpressionParser

Парсер и вычислитель математических выражений.

```javascript
import { ExpressionParser } from './js/ExpressionParser.js';

const parser = new ExpressionParser({ isDegreeMode: true });

// Вычисление выражения
const result = parser.evaluate('sin(30) + cos(60)');
// { success: true, value: 1 }

// Валидация без вычисления
const validation = parser.validate('2 + 3 * ');
// { valid: false, error: 'Недостаточно операндов' }

// Переключение режима градусы/радианы
parser.setDegreeMode(false); // радианы

// Получение списка функций
const functions = parser.getSupportedFunctions();
// ['sin', 'cos', 'tan', 'log', ...]

// Получение констант
const constants = parser.getSupportedConstants();
// { π: 3.14159..., e: 2.71828..., φ: 1.61803... }
```

### ErrorHandler

Обработка ошибок и валидация ввода.

```javascript
import { ErrorHandler } from './js/ErrorHandler.js';

const handler = new ErrorHandler();

// Получение деталей ошибки
const details = handler.getErrorDetails('DIVISION_BY_ZERO');
// { title: 'Деление на ноль', message: '...', severity: 'error', icon: '÷' }

// Валидация выражения
const validation = handler.validateExpression('(2 + 3');
// { valid: false, errors: [{ code: 'UNBALANCED_PARENTHESES', position: 5 }] }

// Валидация результата
const resultCheck = handler.validateResult(Infinity);
// { valid: true, warning: 'INFINITY_RESULT', value: '∞' }

// Форматирование ошибки для отображения
const message = handler.formatError('SQRT_NEGATIVE');
// 'Квадратный корень определён только для неотрицательных чисел'
```

### CalculatorModel

Модель калькулятора с состоянием и историей.

```javascript
import { CalculatorModel } from './js/CalculatorModel.js';

const model = new CalculatorModel();

// Ввод цифр и операторов
model.inputDigit('5');
model.inputOperator('+');
model.inputDigit('3');

// Вычисление
const result = model.calculate();
// { value: 8, expression: '5 + 3' }

// Работа с памятью
model.memoryStore();      // MS
model.memoryRecall();     // MR
model.memoryAdd();        // M+
model.memorySubtract();   // M-
model.memoryClear();      // MC

// История
const history = model.getHistory();
// [{ expression: '5 + 3', result: 8, timestamp: ... }, ...]

// Экспорт/импорт состояния
const state = model.exportState();
model.importState(state);
```

### DisplayView

Управление отображением и темами.

```javascript
import { DisplayView } from './js/DisplayView.js';

const view = new DisplayView();

// Обновление дисплея
view.updateDisplay('123.456');
view.updateExpression('sin(30) + cos(60)');

// Темы
view.setTheme('dark');    // 'light', 'dark', 'high-contrast'
view.toggleTheme();

// Индикаторы
view.showMemoryIndicator();
view.showAngleMode('RAD');
view.showParenthesesIndicator(2);  // 2 открытых скобки

// Обратная связь
view.showError('DIVISION_BY_ZERO');
view.showFunctionFeedback('sin', 30, 0.5);
view.flashKey('sin');     // Подсветка кнопки

// История
view.toggleHistory();
view.addHistoryItem({ expression: '2+2', result: 4 });
```

### UIController

Обработка пользовательского ввода.

```javascript
import { UIController } from './js/UIController.js';

const controller = new UIController(model, view);

// Привязка событий (вызывается автоматически)
controller.bindClickEvents();
controller.bindKeyboardEvents();
controller.bindTouchEvents();

// Программный ввод
controller.handleDigitInput('5');
controller.handleOperatorInput('+');
controller.handleFunctionInput('sin');
controller.handleActionInput('calculate');
```

## ⌨️ Горячие клавиши

| Клавиша | Действие |
|---------|----------|
| `0-9` | Ввод цифр |
| `.` | Десятичная точка |
| `+` `-` `*` `/` | Операторы |
| `^` | Возведение в степень |
| `%` | Остаток от деления |
| `(` `)` | Скобки |
| `Enter` `=` | Вычислить |
| `Escape` | Очистить (C) |
| `Backspace` | Удалить символ |
| `Delete` | Полная очистка (AC) |
| `p` | π (пи) |
| `e` | e (число Эйлера) |
| `s` | sin |
| `c` | cos |
| `t` | tan |
| `l` | log |
| `n` | ln |
| `r` | √ (корень) |
| `!` | Факториал |
| `m` | Переключить режим DEG/RAD |
| `h` | Показать/скрыть историю |

## 🧪 Тестирование

### Запуск тестов в Node.js
```bash
cd prototype/tests
node --experimental-vm-modules run-tests.mjs
```

Ожидаемый результат:
```
═══════════════════════════════════════════════════════════
  CALCULATOR ENGINE - UNIT TESTS
═══════════════════════════════════════════════════════════

✓ Addition: 2 + 3 = 5
✓ sin(30°) = 0.5
... (68 тестов)

───────────────────────────────────────────────────────────
Passed: 68  Failed: 0  Total: 68
═══════════════════════════════════════════════════════════
```

### Запуск тестов в браузере
1. Откройте `prototype/tests/test-runner.html`
2. Нажмите "Run All Tests"

### Бенчмарки производительности
1. Откройте `prototype/tests/performance-benchmarks.html`
2. Нажмите "Run All Benchmarks"

Ожидаемые результаты:
- Базовая арифметика: >500,000 ops/sec
- Тригонометрия: >50,000 ops/sec
- Сложные выражения: >100,000 ops/sec

### Проверка соответствия требованиям
1. Откройте `prototype/tests/requirements-compliance.html`
2. Все требования из `docs/requirements.md` проверяются автоматически

## ♿ Доступность

Калькулятор соответствует стандартам WCAG 2.1:

- **ARIA атрибуты**: `aria-label`, `aria-live`, `aria-pressed`, `role`
- **Семантическая разметка**: `<main>`, `<header>`, `<section>`, `<output>`, `<fieldset>`
- **Клавиатурная навигация**: Полная поддержка Tab, Enter, Escape
- **Скринридеры**: Объявления результатов через `aria-live`
- **Высокий контраст**: Специальная тема с повышенной контрастностью
- **Reduced Motion**: Поддержка `prefers-reduced-motion`

## 🎨 Темы

### Светлая тема (по умолчанию)
```css
--calc-bg: #f5f5f7;
--display-bg: #ffffff;
--key-bg: #e0e0e0;
--accent: #ff9500;
```

### Тёмная тема
```css
--calc-bg: #1c1c1e;
--display-bg: #2c2c2e;
--key-bg: #3a3a3c;
--accent: #ff9f0a;
```

### Высококонтрастная тема
```css
--calc-bg: #000000;
--display-bg: #1a1a1a;
--key-bg: #333333;
--accent: #ffcc00;
```

## 🔧 Совместимость

### Браузеры
- Chrome 80+
- Firefox 75+
- Safari 14+
- Edge 80+

### Мобильные устройства
- iOS Safari 14+
- Chrome for Android 80+

### Требования
- ES6+ модули (или используйте `script.js` для legacy браузеров)
- CSS Grid и Flexbox
- CSS Custom Properties

## 📄 Лицензия

MIT License — свободное использование, модификация и распространение.

## 👥 Авторы

Разработано в рамках проекта инженерного калькулятора.

---

*Для вопросов и предложений создайте Issue в репозитории.*
