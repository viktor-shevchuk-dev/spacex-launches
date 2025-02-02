import { useEffect, useRef } from 'react';
import isEqual from 'lodash/isEqual';

export const useBroadcastChannel = <T>(
  name: string,
  state: T,
  setState: React.Dispatch<React.SetStateAction<T>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const prevStateRef = useRef<T>(state);

  useEffect(() => {
    try {
      const channel = new BroadcastChannel(name);
      channelRef.current = channel;

      const handleMessage = ({ data }: MessageEvent) => setState(data);
      const handleMessageError = ({ data }: MessageEvent) => setError(data);

      channel.addEventListener('message', handleMessage);
      channel.addEventListener('messageerror', handleMessageError);

      return () => {
        channel.removeEventListener('message', handleMessage);
        channel.removeEventListener('messageerror', handleMessageError);
        channel.close();
      };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      setError(errMsg);
    }
  }, [name, setError, setState]);

  useEffect(() => {
    if (!isEqual(prevStateRef.current, state)) {
      channelRef.current?.postMessage(state);
      prevStateRef.current = state;
    }
  }, [state]);
};
