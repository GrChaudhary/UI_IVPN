import React, { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Renders a modal on <body>, so its backdrop covers the whole window (not just a scrolling, blurred panel),
 * while keeping the theme of the screen that opened it.
 */
export default function ModalPortal({ children }) {
  const anchor = useRef(null);
  const [theme, setTheme] = useState(null);
  useLayoutEffect(() => {
    setTheme(anchor.current?.closest('[data-theme]')?.dataset.theme ?? 'dark');
  }, []);
  return (
    <>
      <span ref={anchor} hidden />
      {theme && createPortal(<div data-theme={theme} className="contents">{children}</div>, document.body)}
    </>
  );
}
