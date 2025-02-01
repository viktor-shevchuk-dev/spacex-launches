import { useCallback, useEffect, useRef, useState } from 'react';

interface UseBroadcastChannelOptions {
  name: string;
  onMessage?: (event: MessageEvent) => void;
  onMessageError?: (event: MessageEvent) => void;
}

interface UseBroadcastChannelReturn<D, P> {
  isSupported: boolean;
  channel: BroadcastChannel | undefined;
  data: D | undefined;
  post: (data: P) => void;
  close: () => void;
  messageError: Event | undefined;
  isClosed: boolean;
}

export function useBroadcastChannel<D, P>(
  options: UseBroadcastChannelOptions
): UseBroadcastChannelReturn<D, P> {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const channelRef = useRef<BroadcastChannel | undefined>(undefined);
  const [data, setData] = useState<D | undefined>();
  const [messageError, setMessageError] = useState<Event | undefined>(
    undefined
  );
  const [isClosed, setIsClosed] = useState<boolean>(false);

  useEffect(() => {
    setIsSupported(
      typeof window !== 'undefined' && 'BroadcastChannel' in window
    );
  }, []);

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      setData(event.data as D);
      options.onMessage?.(event);
    },
    [options]
  );

  const handleMessageError = useCallback(
    (event: MessageEvent) => {
      setMessageError(event);
      options.onMessageError?.(event);
    },
    [options]
  );

  useEffect(() => {
    if (isSupported) {
      const newChannel = new BroadcastChannel(options.name);
      channelRef.current = newChannel;

      newChannel.addEventListener('message', handleMessage);
      newChannel.addEventListener('messageerror', handleMessageError);

      return () => {
        newChannel.removeEventListener('message', handleMessage);
        newChannel.removeEventListener('messageerror', handleMessageError);
        if (!isClosed) {
          newChannel.close();
        }
        channelRef.current = undefined;
      };
    }
  }, [isSupported, options.name, handleMessage, handleMessageError, isClosed]);

  const post = useCallback(
    (messageData: P) => {
      if (channelRef.current && !isClosed) {
        channelRef.current.postMessage(messageData);
      }
    },
    [isClosed]
  );

  const close = useCallback(() => {
    if (channelRef.current && !isClosed) {
      channelRef.current.close();
      setIsClosed(true);
    }
  }, [isClosed]);

  return {
    isSupported,
    channel: channelRef.current,
    data,
    post,
    close,
    messageError,
    isClosed,
  };
}
