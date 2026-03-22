# Руководство по стилю (Style Guide)

## 1. Типографика

### Шрифты

| Назначение | Шрифт | Fallback |
|------------|-------|----------|
| Заголовки | SF Pro Display | -apple-system, Arial |
| Основной текст | SF Pro Text | -apple-system, Arial |
| Цифры на дисплее | SF Mono | Menlo, monospace |
| Кнопки | SF Pro Text | -apple-system, Arial |

### Размеры шрифтов

| Элемент | Desktop | Mobile |
|---------|---------|--------|
| Результат (главная строка) | 48px | 36px |
| Выражение (верхняя строка) | 18px | 14px |
| Кнопки (цифры) | 24px | 20px |
| Кнопки (функции) | 16px | 14px |
| Кнопки (память) | 14px | 12px |

### Вес шрифта

| Элемент | Font Weight |
|---------|-------------|
| Результат | 300 (Light) |
| Выражение | 400 (Regular) |
| Кнопки | 500 (Medium) |
| Заголовки | 600 (Semibold) |

## 2. Цветовая палитра

### Основные цвета

```css
/* Светлая тема */
--color-background: #F5F5F7;
--color-surface: #FFFFFF;
--color-text-primary: #1D1D1F;
--color-text-secondary: #86868B;

/* Темная тема */
--color-background-dark: #000000;
--color-surface-dark: #1C1C1E;
--color-text-primary-dark: #F5F5F7;
--color-text-secondary-dark: #98989D;
```

### Акцентные цвета

```css
/* Операторы */
--color-operator: #FF9500;
--color-operator-dark: #FF9F0A;

/* Память */
--color-memory: #007AFF;
--color-memory-dark: #0A84FF;

/* Научные функции */
--color-scientific: #505050;
--color-scientific-dark: #636366;

/* Ошибки */
--color-error: #FF3B30;
--color-error-dark: #FF453A;

/* Успех */
--color-success: #34C759;
--color-success-dark: #30D158;
```

### Кнопки

```css
/* Цифры (светлая тема) */
--btn-digit-bg: #E4E4E6;
--btn-digit-text: #1D1D1F;
--btn-digit-hover: #D8D8DA;

/* Цифры (темная тема) */
--btn-digit-bg-dark: #505050;
--btn-digit-text-dark: #FFFFFF;
--btn-digit-hover-dark: #636366;

/* Операторы (светлая тема) */
--btn-operator-bg: #FF9500;
--btn-operator-text: #FFFFFF;
--btn-operator-hover: #E08600;

/* Операторы (темная тема) */
--btn-operator-bg-dark: #FF9F0A;
--btn-operator-text-dark: #FFFFFF;
--btn-operator-hover-dark: #FFB340;
```

## 3. Сетка и отступы

### Spacing Scale

```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
```

### Размеры кнопок

| Тип | Desktop | Mobile |
|-----|---------|--------|
| Базовая кнопка | 64px × 64px | 72px × 56px |
| Двойная кнопка (0) | 136px × 64px | 152px × 56px |
| Научная кнопка | 56px × 48px | 48px × 40px |
| Кнопка памяти | 48px × 36px | 56px × 32px |

### Зазоры между кнопками

```css
--button-gap: 8px;
--section-gap: 16px;
```

## 4. Радиусы скругления

```css
--radius-sm: 8px;    /* Мелкие элементы */
--radius-md: 12px;   /* Кнопки */
--radius-lg: 16px;   /* Панели */
--radius-xl: 24px;   /* Карточки */
--radius-full: 50%;  /* Круглые элементы */
```

## 5. Тени и эффекты

### Тени (светлая тема)

```css
/* Легкая тень */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);

/* Средняя тень */
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);

/* Глубокая тень */
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);

/* Тень дисплея */
--shadow-display: inset 0 2px 4px rgba(0, 0, 0, 0.06);
```

### Тени (темная тема)

```css
--shadow-sm-dark: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-md-dark: 0 4px 6px rgba(0, 0, 0, 0.4);
--shadow-lg-dark: 0 10px 15px rgba(0, 0, 0, 0.5);
```

## 6. Анимации и переходы

### Длительность

```css
--duration-fast: 100ms;
--duration-normal: 200ms;
--duration-slow: 300ms;
```

### Функции плавности

```css
--ease-out: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Примеры анимаций

```css
/* Нажатие кнопки */
.button:active {
  transform: scale(0.95);
  transition: transform var(--duration-fast) var(--ease-out);
}

/* Hover эффект */
.button:hover {
  background-color: var(--btn-digit-hover);
  transition: background-color var(--duration-normal) var(--ease-out);
}

/* Смена темы */
body {
  transition: background-color var(--duration-slow) var(--ease-in-out),
              color var(--duration-slow) var(--ease-in-out);
}
```

## 7. Иконки

### Размеры иконок

| Контекст | Размер |
|----------|--------|
| Кнопки навигации | 24px |
| Внутри кнопок | 20px |
| Индикаторы | 16px |
| Мелкие подсказки | 12px |

### Стиль иконок

- Линейные (outline) иконки
- Толщина линии: 1.5px
- Скругленные окончания (round caps)
- Согласованность с SF Symbols

## 8. Breakpoints (Точки перехода)

```css
/* Mobile first подход */
--breakpoint-sm: 480px;   /* Маленькие телефоны */
--breakpoint-md: 768px;   /* Планшеты */
--breakpoint-lg: 1024px;  /* Десктоп */
--breakpoint-xl: 1280px;  /* Большие экраны */
```

## 9. Z-Index слои

```css
--z-base: 0;
--z-dropdown: 100;
--z-sticky: 200;
--z-modal: 300;
--z-tooltip: 400;
--z-notification: 500;
```

## 10. Доступность (Accessibility)

### Контрастность
- Минимальный контраст текста: 4.5:1 (WCAG AA)
- Контраст крупного текста: 3:1

### Фокус
```css
*:focus-visible {
  outline: 2px solid var(--color-operator);
  outline-offset: 2px;
}
```

### Размер интерактивных элементов
- Минимальный размер: 44px × 44px (WCAG)
