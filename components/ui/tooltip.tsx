"use client";
import type React from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type TooltipProps = {
  children: ReactNode;
  content: ReactNode;
  variant?: "success" | "warning" | "info";
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  className?: string;
};

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  variant = "info",
  side = "top",
  align = "center",
  className,
}) => {
  // Determine background color based on variant
  const bgColor = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    info: "bg-slate-700",
  }[variant];

  // Determine text color based on variant
  const textColor = {
    success: "text-white",
    warning: "text-white",
    info: "text-white",
  }[variant];

  // Determine position based on side and align
  const position = {
    top: {
      base: "bottom-full mb-2",
      start: "left-0",
      center: "left-1/2 -translate-x-1/2",
      end: "right-0",
    },
    right: {
      base: "left-full ml-2",
      start: "top-0",
      center: "top-1/2 -translate-y-1/2",
      end: "bottom-0",
    },
    bottom: {
      base: "top-full mt-2",
      start: "left-0",
      center: "left-1/2 -translate-x-1/2",
      end: "right-0",
    },
    left: {
      base: "right-full mr-2",
      start: "top-0",
      center: "top-1/2 -translate-y-1/2",
      end: "bottom-0",
    },
  }[side][align];

  // Determine arrow position based on side and align
  const arrowPosition = {
    top: {
      base: "top-full",
      start: "left-3",
      center: "left-1/2 -translate-x-1/2",
      end: "right-3",
    },
    right: {
      base: "right-full",
      start: "top-3",
      center: "top-1/2 -translate-y-1/2",
      end: "bottom-3",
    },
    bottom: {
      base: "bottom-full",
      start: "left-3",
      center: "left-1/2 -translate-x-1/2",
      end: "right-3",
    },
    left: {
      base: "left-full",
      start: "top-3",
      center: "top-1/2 -translate-y-1/2",
      end: "bottom-3",
    },
  }[side][align];

  // Determine arrow rotation based on side
  const arrowRotation = {
    top: "rotate-45",
    right: "rotate-135",
    bottom: "rotate-225",
    left: "rotate-315",
  }[side];

  return (
    <div className="relative group inline-flex">
      <div className="cursor-help">{children}</div>
      <div
        className={cn(
          "absolute z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible",
          "transition-all duration-200 ease-in-out transform group-hover:translate-y-0",
          "pointer-events-none",
          position,
          className
        )}
        style={{
          // Add a small offset for the initial position to create a slide effect
          transform:
            side === "top"
              ? "translateY(5px)"
              : side === "bottom"
              ? "translateY(-5px)"
              : side === "left"
              ? "translateX(5px)"
              : side === "right"
              ? "translateX(-5px)"
              : undefined,
        }}
      >
        <div className={cn("rounded-md py-2 px-3 shadow-lg", bgColor, textColor)}>
          {content}
          <div className={cn("absolute w-2 h-2", bgColor, arrowPosition, arrowRotation)} />
        </div>
      </div>
    </div>
  );
};
