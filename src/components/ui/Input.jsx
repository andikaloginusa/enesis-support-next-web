import React, { forwardRef } from "react";
import { cn } from "@lib/utils";

export const Input = forwardRef(
  ({ label, error, className, id, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-semibold text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full px-4 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all duration-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-500",
            error &&
              "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-500 dark:focus:border-rose-500",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-rose-500 mt-0.5">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";
