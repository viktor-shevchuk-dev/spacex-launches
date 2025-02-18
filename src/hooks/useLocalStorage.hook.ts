import { useState, useEffect } from 'react';

export const useLocalStorage = <T>(
  key: string,
  initialValue: T,
  serialize = JSON.stringify,
  deserialize = JSON.parse
): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    const storedValue = window.localStorage.getItem(key);
    return storedValue !== null ? deserialize(storedValue) : initialValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, serialize(state));
  }, [state, key, serialize]);

  return [state, setState];
};
