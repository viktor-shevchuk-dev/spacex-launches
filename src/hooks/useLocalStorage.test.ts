import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from 'hooks';

describe('useLocalStorage', () => {
  const testKey = 'testKey';
  const testValue = { a: 1, b: 2 };

  beforeEach(() => {
    window.localStorage.clear();
    jest.restoreAllMocks();
  });

  it('should return the initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage(testKey, testValue));
    const [storedValue] = result.current;
    expect(storedValue).toEqual(testValue);
    expect(localStorage.getItem(testKey)).toBe(JSON.stringify(testValue));
  });

  it('should return the value from localStorage if it already exists', () => {
    window.localStorage.setItem(testKey, JSON.stringify({ a: 99, b: 100 }));
    const { result } = renderHook(() => useLocalStorage(testKey, testValue));
    const [storedValue] = result.current;
    expect(storedValue).toEqual({ a: 99, b: 100 });
  });

  it('should update localStorage when state is updated', () => {
    const { result } = renderHook(() => useLocalStorage(testKey, testValue));

    const [, setStoredValue] = result.current;

    act(() => {
      setStoredValue({ a: 42, b: 43 });
    });

    const updated = JSON.parse(window.localStorage.getItem(testKey) as string);
    expect(updated).toEqual({ a: 42, b: 43 });
  });

  it('should return the updated state after calling setState', () => {
    const { result } = renderHook(() => useLocalStorage(testKey, testValue));

    act(() => {
      const [, setStoredValue] = result.current;
      setStoredValue({ a: 10, b: 20 });
    });

    const [storedValueAfterUpdate] = result.current;
    expect(storedValueAfterUpdate).toEqual({ a: 10, b: 20 });
  });
});
