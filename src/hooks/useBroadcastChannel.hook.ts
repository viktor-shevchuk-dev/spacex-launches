import { useEffect, useRef } from 'react';
import isEqual from 'lodash/isEqual';

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;
type SetError = React.Dispatch<React.SetStateAction<string | null>>;

export const useBroadcastChannel = <T>(
  name: string,
  state: T,
  setState: SetState<T>,
  setError: SetError
) => {
  const channelRef = useRef<BroadcastChannel>(new BroadcastChannel(name));
  const prevStateRef = useRef<T>(state);

  useEffect(() => {
    if (!isEqual(prevStateRef.current, state)) {
      channelRef.current.postMessage(state);
      prevStateRef.current = state;
    }
  }, [state]);

  useEffect(() => {
    const handleMessage = ({ data }: MessageEvent) => setState(data);
    const handleMessageError = ({ data }: MessageEvent) => setError(data);
    const channel = channelRef.current;
    channel.addEventListener('message', handleMessage);
    channel.addEventListener('messageerror', handleMessageError);

    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.removeEventListener('messageerror', handleMessageError);
      channel.close();
    };
  }, [setError, setState]);
};
