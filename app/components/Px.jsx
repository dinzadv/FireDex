import React, { memo } from 'react';

export const Px = memo(function Px({ name, size = 20, className = '' }) {
  const I = window.FD_ICONS;
  const file = I && I.files[name] ? I.files[name] : undefined;
  const inner = I && I.fallback[name] ? I.fallback[name] : '';
  return (
    <svg
      className={'pxi ' + className}
      data-px={file}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  );
});
