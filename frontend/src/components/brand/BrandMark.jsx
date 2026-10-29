import React from "react";
import { cn } from "@/lib/utils";

/**
 * Original ServiceHub mark: a four-point service spark inside a soft hub ring.
 * The mark is intentionally simple so it reads at favicon size and inside dark
 * product windows.
 */
export const BrandMark = ({ className, size = 32, muted = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    aria-hidden="true"
    className={cn("shrink-0", className)}
  >
    <circle
      cx="20"
      cy="20"
      r="18.25"
      stroke="currentColor"
      strokeOpacity={muted ? 0.22 : 0.3}
      strokeWidth="1.5"
    />
    <path
      d="M20 5.5c1.35 6.6 5.9 11.15 12.5 12.5-6.6 1.35-11.15 5.9-12.5 12.5-1.35-6.6-5.9-11.15-12.5-12.5C14.1 16.65 18.65 12.1 20 5.5Z"
      fill="currentColor"
    />
    <circle cx="20" cy="18" r="2.15" fill="var(--sh-canvas)" />
  </svg>
);

export const BrandLockup = ({
  className,
  markClassName,
  textClassName,
  showTagline = false,
  size = 34,
  inverted = false,
}) => (
  <span className={cn("inline-flex items-center gap-2.5", className)}>
    <BrandMark
      size={size}
      className={cn(inverted ? "text-on-dark" : "text-primary", markClassName)}
    />
    <span className="flex flex-col leading-none">
      <span
        className={cn(
          "text-[1.35rem] font-semibold tracking-[-0.045em]",
          inverted ? "text-on-dark" : "text-ink",
          textClassName
        )}
      >
        Service<span className={inverted ? "text-coral" : "text-primary"}>Hub</span>
      </span>
      {showTagline && (
        <span
          className={cn(
            "mt-1 text-[10px] font-medium uppercase tracking-[0.18em]",
            inverted ? "text-on-dark-soft" : "text-muted-foreground"
          )}
        >
          Home services, considered
        </span>
      )}
    </span>
  </span>
);

export default BrandMark;
