import React from 'react';

export const Checkbox = ({ className = '', checked, onCheckedChange, ...props }) => (
  <input
    type="checkbox"
    checked={checked}
    onChange={(e) => onCheckedChange?.(e.target.checked)}
    className={`h-4 w-4 rounded border border-primary text-primary focus:ring-2 focus:ring-primary ${className}`}
    {...props}
  />
);