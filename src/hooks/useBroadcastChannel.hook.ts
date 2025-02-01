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
  }, [name, setError, setState]);

  useEffect(() => {
    if (!isEqual(prevStateRef.current, state)) {
      channelRef.current?.postMessage(state);
      prevStateRef.current = state;
    }
  }, [state]);
};
