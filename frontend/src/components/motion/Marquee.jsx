import React from "react";
import { cn } from "@/lib/utils";

/**
 * A quiet, continuous marquee. Content is duplicated for a seamless loop.
 * CSS animation is used so it works without scroll listeners.
 */
export const Marquee = ({
  children,
  className,
  speed = 32,
  pauseOnHover = true,
  reverse = false,
}) => (
  <div className={cn("group relative overflow-hidden", className)}>
    <div
      className={cn(
        "flex w-max items-center gap-4 will-change-transform",
        reverse ? "animate-marquee-reverse" : "animate-marquee",
        pauseOnHover && "group-hover:[animation-play-state:paused]"
      )}
      style={{ animationDuration: `${speed}s` }}
    >
      <div className="flex shrink-0 items-center gap-4">{children}</div>
      <div className="flex shrink-0 items-center gap-4" aria-hidden="true">
        {children}
      </div>
    </div>
  </div>
);
