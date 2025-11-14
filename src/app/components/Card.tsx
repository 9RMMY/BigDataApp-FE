"use client";

import { ReactNode } from "react";
import Button from "./buttons/Button";

interface CardProps {
  title?: string;
  description?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  children?: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export default function Card({
  title,
  description,
  buttonText,
  onButtonClick,
  children,
  className = "",
  noPadding = false,     // ⭐ props에서 꺼내야 함!
}: CardProps) {
  const content = children ?? (
    <>
      {title && <h2 className="text-xl font-semibold mb-3">{title}</h2>}
      {description && <p className="text-gray-600 mb-4">{description}</p>}
      {buttonText && onButtonClick && (
        <Button text={buttonText} onClick={onButtonClick} />
      )}
    </>
  );

  return (
    <div
      className={`rounded-2xl bg-white ${
        noPadding ? "p-0" : "p-4"
      } hover:shadow-md transition-shadow ${className}`}
    >
      {content}
    </div>
  );
}
