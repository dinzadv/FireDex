import React, { memo } from 'react';
import { FB, FILE } from '../icons/data.js';

export const Px = memo(function Px({ name, size = 20, className = '' }) {
  return (
    <svg
      className={'pxi ' + className}
      data-px={FILE[name]}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: FB[name] || '' }}
    />
  );
});
