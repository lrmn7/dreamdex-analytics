import React from "react";

export interface RuleProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export const Rule: React.FC<RuleProps> = ({
  orientation = "horizontal",
  className = "",
}) => {
  if (orientation === "vertical") {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={`w-px self-stretch bg-border-subtle ${className}`}
      />
    );
  }

  return (
    <hr
      role="separator"
      className={`border-0 border-t border-border-subtle my-0 w-full ${className}`}
    />
  );
};
