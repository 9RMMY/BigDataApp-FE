// src/app/components/buttons/LinkButton.tsx
'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface LinkButtonProps {
  text?: string;
  href: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  children?: ReactNode;
}

const LinkButton = ({
  text,
  href,
  variant = 'primary',
  className = '',
  children,
}: LinkButtonProps) => {
  const baseStyles =
    variant === 'ghost'
      ? 'p-0 rounded font-medium transition-colors text-sm'
      : 'px-4 py-2 rounded font-semibold transition-colors text-sm';
  const variantStyles = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'border border-blue-500 text-blue-500 hover:bg-blue-50',
    ghost: 'text-white/90 hover:text-white',
  };

  return (
    <Link
      href={href}
      className={`inline-flex ${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children || text}
    </Link>
  );
};

export default LinkButton;