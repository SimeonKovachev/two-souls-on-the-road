"use client";

import { forwardRef } from "react";
import { type LucideIcon } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "icon";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-plum text-parchment hover:bg-plum-light active:scale-[0.98] shadow-sm",
  secondary: "bg-moonlight text-plum hover:bg-moonlight/80 active:scale-[0.98] border border-plum/20",
  ghost: "text-midnight-soft hover:text-plum hover:bg-moonlight/50 active:scale-[0.98]",
  danger: "bg-red-500 text-white hover:bg-red-600 active:scale-[0.98]",
  icon: "text-midnight-soft hover:text-plum hover:bg-moonlight/50 rounded-full p-2",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "text-sm px-3 py-1.5 gap-1.5",
  md: "text-base px-4 py-2 gap-2",
  lg: "text-lg px-6 py-3 gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      icon: Icon,
      iconRight: IconRight,
      loading,
      fullWidth,
      children,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const iconSize = size === "sm" ? 14 : size === "lg" ? 20 : 16;

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center font-display rounded-lg
          transition-all duration-200 ease-out
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${variant !== "icon" ? sizeStyles[size] : ""}
          ${fullWidth ? "w-full" : ""}
          ${className}
        `}
        {...props}
      >
        {loading ? (
          <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
        ) : Icon ? (
          <Icon size={iconSize} />
        ) : null}
        {children}
        {IconRight && !loading && <IconRight size={iconSize} />}
      </button>
    );
  }
);

Button.displayName = "Button";
