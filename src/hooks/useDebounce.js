"use client";

import { useState, useEffect } from "react";

/**
 * Custom Hook to debounce a value.
 * Useful for delaying API requests or heavy UI filtering until the user stops typing.
 * 
 * @param {any} value - The input value to debounce
 * @param {number} delay - The debounce timeout delay in milliseconds
 * @returns {any} The debounced value
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
