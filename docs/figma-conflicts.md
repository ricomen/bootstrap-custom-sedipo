# Конфликты дизайн-токенов Figma ↔ Bootstrap

Документ фиксирует несоответствия, найденные при переносе токенов из Figma
в проект (Bootstrap 5.3.8 + кастомизация через Sass).

**Источники:**

- **A — Colors:** [Figma node `11:55`](https://www.figma.com/design/gLnxcS2C7VMvnTq5k5ZQtn/Untitled?node-id=11-55) — секция «Colors» с глобальной палитрой и подписями `--bs-*` переменных.
- **B — Alert:** [Figma node `32:10189`](https://www.figma.com/design/gLnxcS2C7VMvnTq5k5ZQtn/Untitled?node-id=32-10189) — `COMPONENT_SET` алерта с 5 вариантами (Success / Danger / Info / Light / Warning).
- **C — Badges:** [Figma node `32:10234`](https://www.figma.com/design/gLnxcS2C7VMvnTq5k5ZQtn/Untitled?node-id=32-10234) — `COMPONENT_SET` бейджа: 10 цветовых × 2 стиля (Fill / Soft) × 2 размера (Default 20px / Medium 24px).
- **D — Button:** [Figma node `32:9890`](https://www.figma.com/design/gLnxcS2C7VMvnTq5k5ZQtn/Untitled?node-id=32-9890) — `COMPONENT_SET` кнопки: 4 стиля (Primary / Secondary / Light / Clean) × 2 размера (Large 48px / Small 38px), с icon-only вариантами.

Конфликты разрешены в файлах:
- `src/scss/_tokens.scss` — обновлены сырые значения токенов;
- `src/scss/_variables.scss` — маппинг на Bootstrap;
- `src/scss/_alerts.scss` — компонент-специфичные переопределения алерта;
- `src/scss/_badges.scss` — компонент-специфичные переопределения бейджа;
- `src/scss/_buttons.scss` — компонент-специфичные переопределения кнопки.

---

## Сводная таблица

| # | Что | Источник A — Colors | Источник B — Alert | Источник C — Badges | Расхождение | Решение |
|---|---|---|---|---|---|---|
| 1 | `Light border-subtle` | Gray 50% — `#e2e2e2` | Gray 75% — `#d3d3d3` | — | hex отличается, оттенок темнее на 1 ступень | Принят hex из alert. Побочный эффект: `light-border-subtle == dark-border-subtle` |
| 2 | `Green 300` (success border-subtle) | в Colors только лейбл, без заливки | `#75b798` | — | Не задано в Colors | Записан `#75b798` как `$token-green-300` |
| 3 | `Yellow 300` (warning border-subtle) | в Colors только лейбл, без заливки | `#ffda6a` | — | Не задано в Colors | Записан `#ffda6a` как `$token-yellow-300` |
| 4 | `Yellow 700` (warning text-emphasis) | в Colors только лейбл, без заливки | — (не используется как текст в alert) | `#997404` (текст Soft Warning) | Не задано в Colors, в C совпало с дефолтом BS | Записан `#997404` как `$token-yellow-700`, источник теперь — C |
| 5 | Цвет текста алерта | Bootstrap по умолчанию: `--bs-{variant}-text-emphasis` (брендовый) | `#2f2f2f` (body) — одинаковый для всех 5 вариантов | — | Конфликт логики: BS красит текст брендом, Figma — телом | `--bs-alert-color: $token-text-body` в `_alerts.scss` |
| 6 | Цвет иконки `Light` | `light-text-emphasis` = Black 50% — `#979797` | `#656565` (Black 75%) | текст Soft Light = `#2f2f2f` (Black 100%) | Тройное расхождение: A `#979797`, B `#656565`, C `#2f2f2f` | Глобальный `$token-emphasis-text-light` обновлён на `#2f2f2f` (C). Иконка `.alert-light > .bi` остаётся `#656565` локально |
| 7 | Цвет иконки `Warning` | `warning-text-emphasis` = Yellow 700 — `#997404` | `#ffc107` (Yellow 500, brand) | текст Soft Warning = `#997404` (Yellow 700) | Икона в B = brand, текст в C = emphasis | Цвет иконки `.alert-warning > .bi` задан напрямую как `#ffc107` |
| 8 | `btn-close` | BS: чёрная SVG-маска + `opacity: .5 → .75` на hover | Простой серый крестик `#656565`, без opacity-эффектов | — | Другая визуальная механика | Переопределён `.alert .btn-close` через CSS `mask` + `color` |
| 9 | `--bs-info` vs `--bs-primary` | оба = Blue 100% `#1961AA` | `#1961AA` (соответствует) | в Badges нет варианта Info — есть только Primary | Не конфликт между источниками, но отступление от стандарта BS (обычно info ≠ primary) | Зафиксировано как осознанное решение дизайна |
| 10 | Font-size алерта | в Colors не указан | `12px` (Inter Regular) | — | BS по умолчанию `1rem` (16px) | `font-size: 0.75rem` в `.alert` |
| 11 | Иконки слева | в Colors не указаны | `check-circle-fill` / `exclamation-triangle-fill` / `info-circle-fill` (Bootstrap Icons) | — | Зависимость не описана | Добавлен пакет `bootstrap-icons` и импорт в `main.js` |
| 12 | `success-text-emphasis` (Green 900) | не указан, лейбла нет в Colors | — (alert не использует emphasis-текст) | `#0a3622` (текст Soft Success) | Новое значение, не было в проекте | Добавлен `$token-green-900: #0a3622`; `$token-emphasis-text-success` перемаплен с `$token-green-500` (`#198754`) на `$token-green-900` |
| 13 | Шрифт системы | в Colors не указан | Inter Regular (но скорее заглушка фрейма Figma, не дизайн-решение) | `Manrope Bold 700` (Badge), `Manrope SemiBold/Medium` (Button) | В стартовом шаблоне проекта стоял `$font-family-sans-serif: "Inter", ...`, но Inter нигде не подключался и в Figma подтверждения нет; Figma-источники упоминают только Manrope | Inter удалён. `$font-family-sans-serif = $token-font-family-display = "Manrope Variable", "Manrope", system-ui, ...`. Подключён через npm-пакет `@fontsource-variable/manrope` (import в `src/main.js`) — self-hosted variable font (200–800), без запросов к Google Fonts. Применяется ко всему body, `.btn`, `.badge` |
| 14 | `badge-border-radius` | не указан | — | `cornerRadius: 12` (≥ половины высоты 20/24 → pill) | BS по умолчанию `var(--bs-border-radius)` = `0.5rem`, бейдж получается «обычным» прямоугольником, а не pill | `$badge-border-radius: 50rem` глобально (pill для всех `.badge`) |
| 15 | Размеры бейджа | не указаны | — | Default 20px (12/14, padding 4/8) и Medium 24px (14/20, padding 4/12) | BS не имеет нативного size-модификатора для `.badge` | Базовый `.badge` = Default 20px (через `$badge-*` в `_variables.scss`); добавлен модификатор `.badge-md` для Medium 24px |
| 16 | Soft-варианты бейджа | не указаны | — | Soft = `*-bg-subtle` + `*-text-emphasis` для Primary / Success / Danger / Warning / Light | В BS нет встроенного `.badge-soft-{color}`; рекомендуемый способ — комбинация `.bg-*-subtle .text-*-emphasis` | Добавлен модификатор `.badge-soft-{primary\|success\|danger\|warning\|light}` в `_badges.scss` |
| 17 | Асимметрия цветовой матрицы | не описана | — | `Dark` существует только в Fill, `Light` — только в Soft | Часть матрицы (Dark Soft, Light Fill) намеренно отсутствует в Figma | Зафиксировано: для Dark используется только `.text-bg-dark`, для Light — только `.badge-soft-light` |
| 18 | Вариант кнопки `Clean` (D) | — | — | `Clean` = прозрачный фон, синий текст (Blue 100 → Blue 75 hover), без подчёркивания, font-weight 500; icon-only-вариант на hover получает серый фон (Gray 15) | В Bootstrap нет аналога: ближайший `.btn-link` имеет `text-decoration: underline` и использует `$link-color`, а не отдельные токены. `.btn-secondary` в BS — серая заливка, не ghost | Добавлен кастомный класс `.btn-clean` в `_buttons.scss` поверх `.btn`; цвета — из токенов `$token-btn-clean-*`; в Figma используется только в Small-размере, но CSS работает для обоих |

---

## Классификация

### Прямые hex-конфликты
*(одно и то же поле — разный цвет в нескольких источниках)*

- **#1** `light-border-subtle` (A vs B)
- **#6** «light emphasis / иконка» (A vs B vs C — тройное расхождение)
- **#7** Warning: цвет иконки (B = brand) vs цвет текста (C = emphasis)
- **#12** `success-text-emphasis` — в проекте было `#198754` (brand), в C — `#0a3622`

### Пропуски в Colors
*(значение есть только в компоненте B или C)*

- **#2** `green-300` (B)
- **#3** `yellow-300` (B)
- **#4** `yellow-700` (теперь подтверждён из C — `#997404`)
- **#10** font-size алерта (B)
- **#11** иконки слева (B)
- **#13** шрифт бейджа Manrope (C)
- **#14** `badge-border-radius` = pill (C)
- **#15** размерные модификаторы бейджа (C)

### Конфликт логики
*(не значения, а правила применения)*

- **#5** цвет текста в алерте
- **#8** механика `btn-close`
- **#16** soft-варианты бейджа (нет нативного API в BS)
- **#17** асимметричная матрица Color × Variant (нет Dark Soft и Light Fill)

### Отступление от стандартного Bootstrap
*(не конфликт между источниками, но требует внимания)*

- **#9** `info == primary`
- **#18** кастомный вариант `.btn-clean` (нет нативного API в BS; `.btn-link` не подходит из-за underline)

---

## Что стоит уточнить у дизайнера

1. **`light-border-subtle`** — должно ли действительно совпадать с `dark-border-subtle` (`#d3d3d3`)? Если нет, какой правильный hex для Light border?
2. **`light-text-emphasis`** — какое значение эталонное: Colors `#979797`, alert-иконка `#656565` или badge-soft-текст `#2f2f2f`? Сейчас глобальный токен = `#2f2f2f` (C), но иконка алерта осталась `#656565` локально.
3. **Warning text-emphasis vs warning icon** — в badge text-emphasis = `#997404` (Yellow 700), а в alert иконка = `#ffc107` (Yellow 500, brand). Это сознательная асимметрия или ошибка?
4. **`success-text-emphasis`** — раньше в проекте было `#198754` (= success brand). Теперь по бейджу `#0a3622`. Проверить, нет ли мест в дизайне, где использовался старый вариант.
5. **`--bs-info == --bs-primary`** — если это сознательное решение, стоит ли явно задокументировать это в дизайн-системе (например, отдельным семантическим алиасом)? Иначе при добавлении info-компонентов будет невозможно визуально отделить их от primary. Дополнительно: в Badges варианта Info нет вовсе — он действительно не нужен в продукте?
6. **Шрифт `Manrope` как единый для всей системы** — подтверждено и реализовано: подключён `@fontsource-variable/manrope`, применяется ко всему body, кнопкам и бейджам. `Inter` из стартового шаблона удалён (в Figma не подтверждён). Вопрос к дизайнеру: если в макете предполагался отдельный шрифт для body (например, Inter Regular или системный), а Manrope только для display-элементов — нужно вернуть разделение и подключить второй пакет.
7. **Pill для всех бейджей** — текущая реализация делает все `.badge` pill-формы глобально. Если где-то нужны прямоугольные бейджи (например, в навигации), нужен отдельный модификатор (`.badge-rounded`) или возврат на `var(--bs-border-radius)` + `.rounded-pill` точечно.
8. **Размеры бейджа** — есть ли третий размер (например, Large)? Нужен ли модификатор `.badge-sm`? Сейчас покрыты только 2 указанных в Figma.
9. **Асимметричная матрица (Dark Soft / Light Fill)** — это намеренный запрет (использовать в коде `.text-bg-dark` без аналога `.badge-soft-dark`)? Если в будущем понадобятся недостающие комбинации, нужно вернуться в Figma за hex.
10. **Типографика** — указано ли где-то централизованно, что у алертов и других утилитарных компонентов используется 12px? Если да — выделить в отдельный размерный токен (например, `$token-font-size-sm`).
11. **Кнопка `Clean`** — в Figma этот вариант представлен только в размере Small. В коде `.btn-clean` работает и без `.btn-sm` (Large 48px, font-weight 500, синий текст без фона). Это (а) намеренное расширение «на всякий случай» или (б) Large-версия Clean не предусмотрена в дизайн-системе и её использовать нельзя? Если (б) — добавить запрет/линт или убрать поддержку. Дополнительно: подтвердить, что отсутствие подчёркивания (в отличие от BS `.btn-link`) — окончательное решение, и Clean не должен выглядеть как ссылка даже внутри текста.

---

## История изменений

| Дата | Что | Кем |
|---|---|---|
| 2026-05-21 | Создан документ, зафиксированы 11 несоответствий по результатам переноса секций Colors и Alert | агент Cursor |
| 2026-05-21 | Добавлен источник C (Badges, node `32:10234`). Конфликты #12–#17 — новые. Конфликты #4, #6, #7, #9 — расширены данными из C. Обновлены классификация и вопросы к дизайнеру | агент Cursor |
| 2026-05-22 | Добавлен источник D (Button, node `32:9890`). Зафиксирован конфликт #18 — кастомный вариант `.btn-clean`, у которого нет нативного аналога в Bootstrap. Добавлен вопрос #11 к дизайнеру | агент Cursor |
| 2026-05-22 | Подключён `@fontsource-variable/manrope` (импорт в `src/main.js`), `<link>` на Google Fonts удалён из `index.html`. Inter удалён из `$font-family-sans-serif` — оказался легаси из стартового шаблона, в Figma не подтверждён. Manrope теперь применяется ко всему body, кнопкам и бейджам. Обновлены конфликт #13 и вопрос #6 | агент Cursor |
