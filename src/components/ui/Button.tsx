import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", icon, children, className = "", disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-sans font-medium transition-all duration-150 select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-primary";

    const variantStyles = {
      primary:
        "bg-text-primary text-black hover:bg-white active:bg-text-secondary disabled:hover:bg-text-primary",
      secondary:
        "bg-surface-2 text-text-primary border border-border hover:bg-surface-3 hover:border-border-strong active:bg-surface-1",
      outline:
        "bg-transparent text-text-primary border border-border hover:bg-surface-1 hover:border-border-strong active:bg-surface-2",
      ghost:
        "bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-1 active:bg-surface-2",
    };

    const sizeStyles = {
      sm: "text-xs px-2.5 py-1.5 rounded-sm gap-1.5 h-8 min-w-[32px]",
      md: "text-sm px-4 py-2 rounded gap-2 h-10 min-w-[40px]",
      lg: "text-base px-6 py-2.5 rounded gap-2.5 h-12 min-w-[48px]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
