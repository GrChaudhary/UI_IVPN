import React from 'react';

/**
 * Page intro under the top bar, which already names the page: a one-line description, optional actions on the right.
 * `title` stays in the DOM (screen readers, document outline) but is not repeated visually.
 */
export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h2 className="sr-only">{title}</h2>
        <p className="text-xs text-fg3">{subtitle}</p>
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}
