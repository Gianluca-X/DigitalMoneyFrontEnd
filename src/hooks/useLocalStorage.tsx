import { useState, useEffect, useRef } from "react";

export function useLocalStorage(
  key: string,
  {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
  }: {
    serialize?: (value: any) => string;
    deserialize?: (value: string) => any;
  } = {}
) {
  const [value, setValue] = useState<T | null>(() => {
    try {
      const valueInLocalStorage = window.localStorage.getItem(key);

      if (!valueInLocalStorage || valueInLocalStorage === "undefined") {
        return null;
      }

      return deserialize(valueInLocalStorage);
    } catch (error) {
      console.error("Error parsing localStorage:", error);
      return null;
    }
  });

  const prevKeyRef = useRef(key);

  useEffect(() => {
    const prevKey = prevKeyRef.current;

    if (prevKey !== key) {
      window.localStorage.removeItem(prevKey);
    }

    prevKeyRef.current = key;

    try {
      if (value === undefined || value === null) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, serialize(value));
      }
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }, [value, serialize, key]);

  return [value, setValue] as const;
}
