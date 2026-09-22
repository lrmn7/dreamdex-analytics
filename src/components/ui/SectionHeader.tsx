import React from "react";

export interface SectionHeaderProps {
  tag?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  size?: "default" | "large" | "compact";
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  tag,
  title,
  description,
  action,
  size = "default",
  className = "",
}) => {
  const titleClasses = {
    compact: "text-lg font-sans font-semibold text-text-primary tracking-tight",
    default: "text-xl md:text-2xl font-sans font-semibold text-text-primary tracking-tight",
    large: "text-2xl md:text-3xl font-sans font-bold text-text-primary tracking-tight",
  };

  return (
    <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 ${className}`}>
      <div className="max-w-2xl">
        {tag && (
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px w-5 bg-border-strong" />
            <span className="text-[11px] font-mono uppercase tracking-[0.15em] text-text-muted font-medium">
              {tag}
            </span>
          </div>
        )}
        <h2 className={titleClasses[size]}>
          {title}
        </h2>
        {description && (
          <p className="text-sm text-text-secondary mt-1.5 font-sans leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
    </div>
  );
};
