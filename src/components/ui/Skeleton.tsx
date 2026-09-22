import React from "react";

export interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  width,
  height,
}) => {
  return (
    <div
      aria-hidden="true"
      className={`bg-surface-2 animate-pulse rounded ${className}`}
      style={{
        width,
        height,
      }}
    />
  );
};
