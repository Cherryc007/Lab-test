import { type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'xs' | 'sm' | 'md';
  iconOnly?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  iconOnly = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const sizeClass = size === 'xs' ? 'btn--xs' : size === 'sm' ? 'btn--sm' : '';
  const variantClass = `btn--${variant}`;
  const iconClass = iconOnly ? 'btn--icon-only' : '';

  return (
    <button
      className={`btn ${variantClass} ${sizeClass} ${iconClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
