import { useState, useRef, useEffect, useCallback, KeyboardEvent } from 'react';

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
  placeholder?: string;
  /** Filtrar opções pelo texto (padrão: filtra por label) */
  filterOption?: (option: ComboboxOption, search: string) => boolean;
  /** Máximo de itens no dropdown (padrão 12) */
  maxOptions?: number;
  /** Classe do container */
  className?: string;
  /** Classe do input */
  inputClassName?: string;
  /** Label acessível */
  'aria-label'?: string;
}

const defaultFilter = (option: ComboboxOption, search: string): boolean => {
  const s = search.trim().toLowerCase();
  if (!s) return true;
  return option.label.toLowerCase().includes(s);
};

export function Combobox({
  options,
  value,
  onChange,
  onSelect,
  placeholder = 'Buscar...',
  filterOption = defaultFilter,
  maxOptions = 12,
  className = '',
  inputClassName = '',
  'aria-label': ariaLabel = 'Buscar e selecionar',
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = options.filter((opt) => filterOption(opt, value));
  const visible = filtered.slice(0, maxOptions);

  const focusSearch = useCallback(() => {
    setOpen(true);
    setHighlightIndex(0);
  }, []);

  const selectByIndex = useCallback(
    (index: number) => {
      const opt = visible[index];
      if (opt && !opt.disabled) {
        onSelect(opt.value);
        onChange('');
        setOpen(false);
      }
    },
    [visible, onSelect, onChange]
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open && e.key !== 'Escape') {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        setOpen(true);
        setHighlightIndex(0);
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIndex((i) => (i < visible.length - 1 ? i + 1 : i));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIndex((i) => (i > 0 ? i - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (visible.length > 0) selectByIndex(highlightIndex);
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    setHighlightIndex(0);
  }, [value, options.length]);

  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const el = listRef.current.children[highlightIndex] as HTMLElement;
      el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [highlightIndex]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={focusSearch}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls="combobox-list"
        aria-activedescendant={visible[highlightIndex] ? `combobox-option-${visible[highlightIndex].value}` : undefined}
        aria-label={ariaLabel}
        id="combobox-input"
        className={inputClassName}
      />
      {open && (
        <ul
          ref={listRef}
          id="combobox-list"
          role="listbox"
          className="absolute z-50 top-full left-0 right-0 mt-1 max-h-72 overflow-y-auto bg-[#1a1a1a] border border-white/20 rounded-xl shadow-xl py-1"
        >
          {visible.length === 0 ? (
            <li className="px-4 py-3 text-white/50 text-sm" role="option">
              Nenhum resultado
            </li>
          ) : (
            visible.map((opt, i) => (
              <li
                key={opt.value}
                id={`combobox-option-${opt.value}`}
                role="option"
                aria-selected={i === highlightIndex}
                className={`px-4 py-3 cursor-pointer border-b border-white/5 last:border-0 ${
                  i === highlightIndex ? 'bg-amber-500/30 text-white' : 'text-white hover:bg-white/10'
                } ${opt.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onMouseEnter={() => setHighlightIndex(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (!opt.disabled) {
                    onSelect(opt.value);
                    onChange('');
                    setOpen(false);
                  }
                }}
              >
                {opt.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
