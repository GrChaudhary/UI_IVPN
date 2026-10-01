import React from 'react';
import { Sun, Moon } from 'lucide-react';

/** Light/dark switch (Uiverse "metanef" design). Checked = dark mode. Styles: `.theme-switch` in index.css. */
export default function ThemeSwitch({ dark, onChange }) {
  return (
    <label className="theme-switch" title={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
      <input type="checkbox" role="switch" className="theme-switch__input" checked={dark} onChange={(e) => onChange(e.target.checked)} aria-label="Dark mode" />
      <span className="theme-switch__slider">
        <Sun className="theme-switch__sun" aria-hidden="true" />
        <Moon className="theme-switch__moon" aria-hidden="true" />
      </span>
    </label>
  );
}
