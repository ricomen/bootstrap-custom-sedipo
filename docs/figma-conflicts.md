# Конфликты дизайн-токенов Figma ↔ Bootstrap

Документ фиксирует несоответствия, найденные при переносе токенов из Figma
в проект (Bootstrap 5.3.8 + кастомизация через Sass).

**Источники:**

- **A — Colors:** [Figma node `11:55`](https://www.figma.com/design/gLnxcS2C7VMvnTq5k5ZQtn/Untitled?node-id=11-55) — секция «Colors» с глобальной палитрой и подписями `--bs-*` переменных.
- **B — Alert:** [Figma node `32:10189`](https://www.figma.com/design/gLnxcS2C7VMvnTq5k5ZQtn/Untitled?node-id=32-10189) — `COMPONENT_SET` алерта с 5 вариантами (Success / Danger / Info / Light / Warning).

Конфликты разрешены в файлах:
- `src/scss/_tokens.scss` — обновлены сырые значения токенов;
- `src/scss/_variables.scss` — маппинг на Bootstrap;
- `src/scss/_alerts.scss` — компонент-специфичные переопределения.

---

## Сводная таблица

| # | Что | Источник A — Colors | Источник B — Alert | Расхождение | Решение |
|---|---|---|---|---|---|
| 1 | `Light border-subtle` | Gray 50% — `#e2e2e2` | Gray 75% — `#d3d3d3` | hex отличается, оттенок темнее на 1 ступень | Принят hex из alert. Побочный эффект: `light-border-subtle == dark-border-subtle` |
| 2 | `Green 300` (success border-subtle) | в Colors только лейбл, без заливки | `#75b798` | Не задано в Colors | Записан `#75b798` как `$token-green-300` |
| 3 | `Yellow 300` (warning border-subtle) | в Colors только лейбл, без заливки | `#ffda6a` | Не задано в Colors | Записан `#ffda6a` как `$token-yellow-300` |
| 4 | `Yellow 700` (warning text-emphasis) | в Colors только лейбл, без заливки | — (не используется как текст в alert) | Не задано нигде | Оставлен дефолт Bootstrap `#997404`, отмечено комментарием в `_tokens.scss` |
| 5 | Цвет текста алерта | Bootstrap по умолчанию: `--bs-{variant}-text-emphasis` (брендовый) | `#2f2f2f` (body) — одинаковый для всех 5 вариантов | Конфликт логики: BS красит текст брендом, Figma — телом | `--bs-alert-color: $token-text-body` в `_alerts.scss` |
| 6 | Цвет иконки `Light` | `light-text-emphasis` = Black 50% — `#979797` | `#656565` (Black 75%) | hex отличается | Цвет иконки `.alert-light > .bi` задан напрямую |
| 7 | Цвет иконки `Warning` | `warning-text-emphasis` = Yellow 700 — `#997404` | `#ffc107` (Yellow 500, brand) | Другой оттенок (brand вместо emphasis) | Цвет иконки `.alert-warning > .bi` задан напрямую |
| 8 | `btn-close` | BS: чёрная SVG-маска + `opacity: .5 → .75` на hover | Простой серый крестик `#656565`, без opacity-эффектов | Другая визуальная механика | Переопределён `.alert .btn-close` через CSS `mask` + `color` |
| 9 | `--bs-info` vs `--bs-primary` | оба = Blue 100% `#1961AA` | `#1961AA` (соответствует) | Не конфликт между источниками, но отступление от стандарта BS (обычно info ≠ primary) | Зафиксировано как осознанное решение дизайна |
| 10 | Font-size алерта | в Colors не указан | `12px` (Inter Regular) | BS по умолчанию `1rem` (16px) | `font-size: 0.75rem` в `.alert` |
| 11 | Иконки слева | в Colors не указаны | `check-circle-fill` / `exclamation-triangle-fill` / `info-circle-fill` (Bootstrap Icons) | Зависимость не описана | Добавлен пакет `bootstrap-icons` и импорт в `main.js` |

---

## Классификация

### Прямые hex-конфликты
*(одно и то же поле — разный цвет в источниках A и B)*

- **#1** `light-border-subtle`
- **#6** иконка Light
- **#7** иконка Warning

### Пропуски в Colors
*(значение есть только в компоненте B)*

- **#2** `green-300`
- **#3** `yellow-300`
- **#4** `yellow-700` (пропущено в обоих)
- **#10** font-size
- **#11** иконки (Bootstrap Icons)

### Конфликт логики
*(не значения, а правила применения)*

- **#5** цвет текста в алерте
- **#8** механика `btn-close`

### Отступление от стандартного Bootstrap
*(не конфликт между источниками, но требует внимания)*

- **#9** `info == primary`

---

## Что стоит уточнить у дизайнера

1. **`light-border-subtle`** — должно ли действительно совпадать с `dark-border-subtle` (`#d3d3d3`)? Если нет, какой правильный hex для Light border?
2. **Light / Warning text-emphasis** — какой эталон для глобальных токенов: значения из Colors (Black 50% / Yellow 700) или из alert (Black 75% / Yellow 500)? Сейчас глобальные токены и компонент-уровень расходятся.
3. **`--bs-info == --bs-primary`** — если это сознательное решение, стоит ли явно задокументировать это в дизайн-системе (например, отдельным семантическим алиасом)? Иначе при добавлении info-компонентов будет невозможно визуально отделить их от primary.
4. **Yellow 700** — нужен точный hex для `warning-text-emphasis`, чтобы не оставлять дефолт Bootstrap (`#997404`).
5. **Типографика** — указано ли где-то централизованно, что у алертов и других утилитарных компонентов используется 12px? Если да — выделить в отдельный размерный токен (например, `$token-font-size-sm`).

---

## История изменений

| Дата | Что | Кем |
|---|---|---|
| 2026-05-21 | Создан документ, зафиксированы 11 несоответствий по результатам переноса секций Colors и Alert | агент Cursor |
