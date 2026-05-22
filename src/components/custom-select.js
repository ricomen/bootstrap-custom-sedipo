// =============================================================================
// CustomSelect — кастомный select на Vue 3 (Composition API).
//
// Без сторонних зависимостей. Стили — в src/scss/_select.scss.
// Использует window.Vue, т.к. проект подключает Vue через CDN.
//
// API (props):
//   modelValue            — v-model (любой тип; массив, если multiple)
//   options               — Array<string|number|object>
//   placeholder           — placeholder при пустом значении
//   multiple              — множественный выбор (значение всегда массив)
//   searchable            — поле поиска над списком
//   clearable             — крестик «очистить» в trigger
//   disabled              — недоступен
//   invalid               — визуальный invalid-стиль
//   error                 — текст ошибки (включает invalid автоматически)
//   help                  — вспомогательный текст под select
//   label                 — лейбл сверху
//   size                  — 'sm' | 'md' | 'lg'
//   valueKey/labelKey     — поля объектов options
//   descriptionKey/iconKey/disabledKey
//   maxHeight             — макс. высота списка (CSS)
//   noResultsText         — текст пустого результата
//   searchPlaceholder     — placeholder поиска
//   name                  — для скрытого <input> (отправка формы)
//
// Слоты:
//   selected({ option })  — кастомный рендер выбранного значения (single)
//   option({ option, selected, highlighted }) — кастомный рендер опции
//
// События:
//   update:modelValue, change, open, close, search, clear
// =============================================================================

const {
  defineComponent, ref, computed, onMounted, onBeforeUnmount, nextTick,
} = window.Vue;

let _uid = 0;

export default defineComponent({
  name: 'CustomSelect',

  props: {
    modelValue: { type: null, default: null },
    options: { type: Array, default: () => [] },
    placeholder: { type: String, default: 'Выберите...' },
    multiple: { type: Boolean, default: false },
    searchable: { type: Boolean, default: false },
    clearable: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    invalid: { type: Boolean, default: false },
    error: { type: String, default: '' },
    help: { type: String, default: '' },
    label: { type: String, default: '' },
    size: {
      type: String,
      default: 'md',
      validator: (v) => ['sm', 'md', 'lg'].includes(v),
    },
    valueKey: { type: String, default: 'value' },
    labelKey: { type: String, default: 'label' },
    descriptionKey: { type: String, default: 'description' },
    iconKey: { type: String, default: 'icon' },
    disabledKey: { type: String, default: 'disabled' },
    maxHeight: { type: String, default: '15rem' },
    noResultsText: { type: String, default: 'Нет результатов' },
    searchPlaceholder: { type: String, default: 'Поиск...' },
    name: { type: String, default: '' },
    id: { type: String, default: '' },
  },

  emits: ['update:modelValue', 'change', 'open', 'close', 'search', 'clear'],

  setup(props, { emit, expose }) {
    const uid = ++_uid;
    const listId = `cs-list-${uid}`;
    const inputId = props.id || `cs-trigger-${uid}`;

    const isOpen = ref(false);
    const query = ref('');
    const highlightedIndex = ref(-1);

    const rootRef = ref(null);
    const triggerRef = ref(null);
    const searchRef = ref(null);
    const listRef = ref(null);

    // ---- Нормализация опций ------------------------------------------------
    const normalizedOptions = computed(() =>
      (props.options || []).map((o) => {
        if (o !== null && typeof o === 'object') {
          const value = o[props.valueKey];
          return {
            value,
            label: o[props.labelKey] ?? String(value ?? ''),
            description: o[props.descriptionKey] ?? '',
            icon: o[props.iconKey] ?? '',
            disabled: !!o[props.disabledKey],
            _raw: o,
          };
        }
        return {
          value: o,
          label: String(o),
          description: '',
          icon: '',
          disabled: false,
          _raw: o,
        };
      })
    );

    const filteredOptions = computed(() => {
      if (!props.searchable || !query.value) return normalizedOptions.value;
      const q = query.value.trim().toLowerCase();
      if (!q) return normalizedOptions.value;
      return normalizedOptions.value.filter((o) => {
        const inLabel = o.label.toLowerCase().includes(q);
        const inDesc = o.description && o.description.toLowerCase().includes(q);
        return inLabel || inDesc;
      });
    });

    // ---- Выбранное значение ------------------------------------------------
    const selectedArray = computed(() => {
      if (props.multiple) {
        return Array.isArray(props.modelValue) ? props.modelValue : [];
      }
      return props.modelValue === null || props.modelValue === undefined
        ? []
        : [props.modelValue];
    });

    const selectedOptions = computed(() =>
      selectedArray.value.map(
        (v) =>
          normalizedOptions.value.find((o) => o.value === v) || {
            value: v,
            label: String(v),
            description: '',
            icon: '',
            disabled: false,
            _raw: v,
          }
      )
    );

    const hasValue = computed(() => selectedArray.value.length > 0);

    function isSelected(opt) {
      return selectedArray.value.includes(opt.value);
    }

    // ---- Открытие / закрытие ----------------------------------------------
    function open() {
      if (props.disabled || isOpen.value) return;
      isOpen.value = true;
      emit('open');

      const list = filteredOptions.value;
      const selIdx = list.findIndex(isSelected);
      const firstEnabledIdx = list.findIndex((o) => !o.disabled);
      highlightedIndex.value = selIdx >= 0 ? selIdx : firstEnabledIdx;

      nextTick(() => {
        if (props.searchable && searchRef.value) searchRef.value.focus();
        scrollHighlightedIntoView();
      });
    }

    function close() {
      if (!isOpen.value) return;
      isOpen.value = false;
      query.value = '';
      emit('close');
      nextTick(() => {
        if (triggerRef.value) triggerRef.value.focus();
      });
    }

    function toggle() {
      if (isOpen.value) close();
      else open();
    }

    // ---- Выбор -------------------------------------------------------------
    function selectOption(opt) {
      if (!opt || opt.disabled) return;
      if (props.multiple) {
        const set = new Set(selectedArray.value);
        if (set.has(opt.value)) set.delete(opt.value);
        else set.add(opt.value);
        const next = Array.from(set);
        emit('update:modelValue', next);
        emit('change', next);
      } else {
        emit('update:modelValue', opt.value);
        emit('change', opt.value);
        close();
      }
    }

    function clear() {
      if (props.disabled) return;
      const next = props.multiple ? [] : null;
      emit('update:modelValue', next);
      emit('change', next);
      emit('clear');
    }

    function removeChip(opt) {
      if (!props.multiple || props.disabled) return;
      const next = selectedArray.value.filter((v) => v !== opt.value);
      emit('update:modelValue', next);
      emit('change', next);
    }

    // ---- Клавиатура --------------------------------------------------------
    function moveHighlight(delta) {
      const list = filteredOptions.value;
      if (!list.length) return;
      let i = highlightedIndex.value;
      if (i < 0) i = delta > 0 ? -1 : list.length;
      for (let n = 0; n < list.length; n++) {
        i = (i + delta + list.length) % list.length;
        if (!list[i].disabled) {
          highlightedIndex.value = i;
          scrollHighlightedIntoView();
          return;
        }
      }
    }

    function scrollHighlightedIntoView() {
      nextTick(() => {
        if (!listRef.value) return;
        const el = listRef.value.querySelector('.cs__option.is-highlighted');
        if (el && typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({ block: 'nearest' });
        }
      });
    }

    function onTriggerKeydown(e) {
      if (props.disabled) return;
      const k = e.key;

      if (k === 'ArrowDown') {
        e.preventDefault();
        if (!isOpen.value) open();
        else moveHighlight(1);
        return;
      }
      if (k === 'ArrowUp') {
        e.preventDefault();
        if (!isOpen.value) open();
        else moveHighlight(-1);
        return;
      }
      if (k === 'Enter' || k === ' ') {
        e.preventDefault();
        if (!isOpen.value) {
          open();
        } else {
          const opt = filteredOptions.value[highlightedIndex.value];
          if (opt) selectOption(opt);
        }
        return;
      }
      if (k === 'Escape') {
        if (isOpen.value) {
          e.preventDefault();
          close();
        }
        return;
      }
      if (k === 'Tab') {
        if (isOpen.value) close();
        return;
      }
      if (k === 'Home') {
        e.preventDefault();
        const idx = filteredOptions.value.findIndex((o) => !o.disabled);
        if (idx >= 0) {
          highlightedIndex.value = idx;
          scrollHighlightedIntoView();
        }
        return;
      }
      if (k === 'End') {
        e.preventDefault();
        for (let i = filteredOptions.value.length - 1; i >= 0; i--) {
          if (!filteredOptions.value[i].disabled) {
            highlightedIndex.value = i;
            scrollHighlightedIntoView();
            return;
          }
        }
        return;
      }

      // type-ahead (только когда поиск выключен)
      if (!props.searchable && k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const ch = k.toLowerCase();
        const idx = filteredOptions.value.findIndex(
          (o) => !o.disabled && o.label.toLowerCase().startsWith(ch)
        );
        if (idx >= 0) {
          if (!isOpen.value) open();
          highlightedIndex.value = idx;
          scrollHighlightedIntoView();
        }
      }
    }

    function onSearchKeydown(e) {
      const k = e.key;
      if (k === 'ArrowDown') { e.preventDefault(); moveHighlight(1); return; }
      if (k === 'ArrowUp')   { e.preventDefault(); moveHighlight(-1); return; }
      if (k === 'Enter') {
        e.preventDefault();
        const opt = filteredOptions.value[highlightedIndex.value];
        if (opt) selectOption(opt);
        return;
      }
      if (k === 'Escape') { e.preventDefault(); close(); return; }
      if (k === 'Tab') { close(); }
    }

    function onSearchInput(e) {
      query.value = e.target.value;
      emit('search', query.value);
      const idx = filteredOptions.value.findIndex((o) => !o.disabled);
      highlightedIndex.value = idx;
    }

    // ---- Клик вне ----------------------------------------------------------
    function onDocMouseDown(e) {
      if (!isOpen.value) return;
      if (rootRef.value && !rootRef.value.contains(e.target)) close();
    }

    onMounted(() => document.addEventListener('mousedown', onDocMouseDown));
    onBeforeUnmount(() =>
      document.removeEventListener('mousedown', onDocMouseDown)
    );

    expose({ open, close, toggle, clear, focus: () => triggerRef.value?.focus() });

    // ---- Скрытое значение для отправки формы ------------------------------
    const hiddenValue = computed(() =>
      props.multiple
        ? JSON.stringify(selectedArray.value)
        : props.modelValue === null || props.modelValue === undefined
          ? ''
          : String(props.modelValue)
    );

    const activeDescendant = computed(() =>
      isOpen.value && filteredOptions.value[highlightedIndex.value]
        ? `${listId}-opt-${highlightedIndex.value}`
        : null
    );

    return {
      // state
      isOpen, query, highlightedIndex,
      // refs
      rootRef, triggerRef, searchRef, listRef,
      // ids
      listId, inputId,
      // computed
      normalizedOptions, filteredOptions, selectedOptions, selectedArray,
      hasValue, hiddenValue, activeDescendant,
      // methods
      isSelected, toggle, open, close, clear, removeChip, selectOption,
      onTriggerKeydown, onSearchKeydown, onSearchInput,
    };
  },

  template: /* html */ `
    <div
      class="cs"
      ref="rootRef"
      :class="[
        'cs--' + size,
        {
          'cs--open': isOpen,
          'cs--disabled': disabled,
          'cs--invalid': invalid || !!error,
          'cs--multiple': multiple
        }
      ]"
    >
      <label v-if="label" class="cs__label" :for="inputId">{{ label }}</label>

      <div
        :id="inputId"
        ref="triggerRef"
        class="cs__trigger"
        role="combobox"
        :tabindex="disabled ? -1 : 0"
        :aria-haspopup="'listbox'"
        :aria-expanded="isOpen"
        :aria-controls="listId"
        :aria-disabled="disabled || null"
        :aria-invalid="(invalid || !!error) || null"
        :aria-activedescendant="activeDescendant"
        @click="toggle"
        @keydown="onTriggerKeydown"
      >
        <span class="cs__value">
          <template v-if="!hasValue">
            <span class="cs__placeholder">{{ placeholder }}</span>
          </template>

          <template v-else-if="multiple">
            <span
              v-for="opt in selectedOptions"
              :key="opt.value"
              class="cs__chip"
            >
              <i v-if="opt.icon" :class="['bi', opt.icon]" aria-hidden="true"></i>
              <span>{{ opt.label }}</span>
              <button
                v-if="!disabled"
                type="button"
                class="cs__chip-remove"
                :aria-label="'Удалить ' + opt.label"
                @click.stop="removeChip(opt)"
                @mousedown.stop
              >
                <i class="bi bi-x" aria-hidden="true"></i>
              </button>
            </span>
          </template>

          <template v-else>
            <slot name="selected" :option="selectedOptions[0]">
              <span class="cs__value-single">
                <i
                  v-if="selectedOptions[0].icon"
                  :class="['bi', selectedOptions[0].icon]"
                  aria-hidden="true"
                ></i>
                <span>{{ selectedOptions[0].label }}</span>
              </span>
            </slot>
          </template>
        </span>

        <span class="cs__actions">
          <button
            v-if="clearable && hasValue && !disabled"
            type="button"
            class="cs__clear"
            aria-label="Очистить"
            tabindex="-1"
            @click.stop="clear"
            @mousedown.stop
          >
            <i class="bi bi-x-lg" aria-hidden="true"></i>
          </button>
          <span class="cs__caret" aria-hidden="true">
            <i class="bi bi-chevron-down"></i>
          </span>
        </span>
      </div>

      <div v-if="isOpen" class="cs__dropdown">
        <div v-if="searchable" class="cs__search">
          <input
            ref="searchRef"
            type="text"
            class="cs__search-input"
            :value="query"
            :placeholder="searchPlaceholder"
            autocomplete="off"
            spellcheck="false"
            @input="onSearchInput"
            @keydown="onSearchKeydown"
          />
        </div>

        <ul
          :id="listId"
          ref="listRef"
          class="cs__list"
          role="listbox"
          :aria-multiselectable="multiple"
          :style="{ maxHeight: maxHeight }"
        >
          <li
            v-for="(opt, idx) in filteredOptions"
            :key="opt.value"
            :id="listId + '-opt-' + idx"
            class="cs__option"
            role="option"
            :class="{
              'is-highlighted': idx === highlightedIndex,
              'is-selected': isSelected(opt),
              'is-disabled': opt.disabled
            }"
            :aria-selected="isSelected(opt)"
            :aria-disabled="opt.disabled || null"
            @mousedown.prevent
            @click="selectOption(opt)"
            @mouseenter="!opt.disabled && (highlightedIndex = idx)"
          >
            <slot
              name="option"
              :option="opt"
              :selected="isSelected(opt)"
              :highlighted="idx === highlightedIndex"
            >
              <i
                v-if="opt.icon"
                :class="['bi', opt.icon, 'cs__option-icon']"
                aria-hidden="true"
              ></i>
              <span class="cs__option-text">
                <span class="cs__option-label">{{ opt.label }}</span>
                <span v-if="opt.description" class="cs__option-description">
                  {{ opt.description }}
                </span>
              </span>
              <span v-if="isSelected(opt)" class="cs__option-check" aria-hidden="true">
                <i class="bi bi-check2"></i>
              </span>
            </slot>
          </li>

          <li v-if="!filteredOptions.length" class="cs__empty">
            {{ noResultsText }}
          </li>
        </ul>
      </div>

      <div v-if="error" class="cs__help cs__help--error" role="alert">{{ error }}</div>
      <div v-else-if="help" class="cs__help">{{ help }}</div>

      <input v-if="name" type="hidden" :name="name" :value="hiddenValue" />
    </div>
  `,
});
