import React, { useRef, useState } from 'react';
import { Select as RadixSelect } from 'radix-ui';
import { Check, ChevronDown } from 'lucide-react';

/**
 * App-wide dropdown (Radix Select: keyboard, typeahead, screen-reader support).
 * options: string | { value, label?, dot?, icon?, chip? }
 *   dot  = tailwind bg class for a colour dot, icon = lucide component,
 *   chip = classes that turn the trigger into a coloured badge while this option is selected.
 */
const normalize = (o) => (typeof o === 'string' ? { value: o, label: o } : { label: o.value, ...o });

function Label({ option }) {
  const Icon = option.icon;
  return (
    <span className="inline-flex items-center gap-2 truncate">
      {Icon && <Icon size={12} />}
      {option.dot && <span className={`w-2 h-2 rounded-full shrink-0 ${option.dot}`} />}
      {option.label}
    </span>
  );
}

const SIZE = { sm: 'px-3 py-2 text-xs', md: 'px-3.5 py-2.5 text-xs', lg: 'px-4 py-3 text-sm' };

export default function Select({ value, onValueChange, options, placeholder = 'Select…', disabled, size = 'sm', shape = 'rounded', className = '', ...aria }) {
  const triggerRef = useRef(null);
  const [theme, setTheme] = useState('dark');
  const items = options.map(normalize);
  const current = items.find((o) => o.value === value);

  // The menu is portalled to <body>, so re-apply the theme of the screen it opened from.
  const handleOpenChange = (open) => {
    if (open) setTheme(triggerRef.current?.closest('[data-theme]')?.dataset.theme ?? 'dark');
  };

  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange} disabled={disabled} onOpenChange={handleOpenChange}>
      <RadixSelect.Trigger
        ref={triggerRef}
        {...aria}
        className={`group inline-flex items-center justify-between gap-2 ${shape === 'pill' ? 'rounded-full' : 'rounded-lg'} border font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan-500/50 data-[placeholder]:text-fg4 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-70 ${SIZE[size]} ${
          current?.chip ?? 'bg-inset border-ink/[0.1] text-fg hover:border-ink/25 data-[state=open]:border-cyan-500/60'
        } ${className}`}
      >
        <RadixSelect.Value placeholder={placeholder}>{current && <Label option={current} />}</RadixSelect.Value>
        {!disabled && (
          <RadixSelect.Icon>
            <ChevronDown size={size === 'lg' ? 16 : 13} className="opacity-70 transition-transform group-data-[state=open]:rotate-180" />
          </RadixSelect.Icon>
        )}
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          data-theme={theme}
          position="popper"
          sideOffset={6}
          align="start"
          className="select-content z-[100] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-ink/[0.12] bg-surface text-fg shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
        >
          <RadixSelect.Viewport className="p-1.5 max-h-[min(20rem,var(--radix-select-content-available-height))]">
            {items.map((o) => (
              <RadixSelect.Item
                key={o.value}
                value={o.value}
                className="flex cursor-pointer select-none items-center gap-3 rounded-lg px-2.5 py-2 text-xs font-medium outline-none text-fg2 data-[highlighted]:bg-cyan-500/10 data-[highlighted]:text-fg data-[state=checked]:text-cyan-300"
              >
                <RadixSelect.ItemText><Label option={o} /></RadixSelect.ItemText>
                <RadixSelect.ItemIndicator className="ml-auto"><Check size={13} /></RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
