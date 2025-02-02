import { renderHook, act } from '@testing-library/react';
import { useState } from 'react';

import { useBroadcastChannel } from 'hooks';

const mockChannelName = 'rocket-cost-channel';
const originalBroadcastChannel = global.BroadcastChannel;

describe('useBroadcastChannel', () => {
  let broadcastChannelMock: {
    postMessage: jest.Mock;
    close: jest.Mock;
    addEventListener: jest.Mock;
    removeEventListener: jest.Mock;
  };

  beforeEach(() => {
    broadcastChannelMock = {
      postMessage: jest.fn(),
      close: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    global.BroadcastChannel = jest.fn(() => broadcastChannelMock) as any;
  });

  afterEach(() => {
    global.BroadcastChannel = originalBroadcastChannel;
    jest.clearAllMocks();
  });

  it('should create a broadcast channel with the given name', () => {
    const { unmount } = renderHook(() => {
      const [data, setData] = useState({});
      const [error, setError] = useState<string | null>(null);

      useBroadcastChannel(mockChannelName, data, setData, setError);
      return { data, setData, error };
    });

    expect(global.BroadcastChannel).toHaveBeenCalledTimes(1);
    expect(global.BroadcastChannel).toHaveBeenCalledWith(mockChannelName);

    unmount();
    expect(broadcastChannelMock.close).toHaveBeenCalledTimes(1);
  });

  it('should post a message when local data changes', () => {
    const { result } = renderHook(() => {
      const [data, setData] = useState({ costMap: { rocketA: 123 } });
      const [error, setError] = useState<string | null>(null);

      useBroadcastChannel(mockChannelName, data, setData, setError);
      return { data, setData, error };
    });

    expect(broadcastChannelMock.postMessage).toHaveBeenCalledTimes(0);

    const payload = { costMap: { rocketA: 999 } };

    act(() => {
      result.current.setData(payload);
    });

    expect(broadcastChannelMock.postMessage).toHaveBeenCalledTimes(1);
    expect(broadcastChannelMock.postMessage).toHaveBeenCalledWith(payload);
  });

  it('should update local data when a message is received from the broadcast channel', () => {
    const { result } = renderHook(() => {
      const [data, setData] = useState({ costMap: { rocketA: 123 } });
      const [error, setError] = useState<string | null>(null);
      useBroadcastChannel(mockChannelName, data, setData, setError);
      return { data, setData, error };
    });
    const onMessageHandler =
      broadcastChannelMock.addEventListener.mock.calls[0][1];
    const mockEvent = { data: { costMap: { rocketB: 456 } } };
    act(() => {
      onMessageHandler({ data: mockEvent });
    });
    expect(result.current.data).toEqual(mockEvent);
  });

  it('should handle errors if the broadcast channel is not supported or fails to instantiate', () => {
    (global.BroadcastChannel as jest.Mock).mockImplementationOnce(() => {
      throw new Error('BroadcastChannel not supported');
    });

    const { result } = renderHook(() => {
      const [data, setData] = useState({});
      const [error, setError] = useState<string | null>(null);

      useBroadcastChannel(mockChannelName, data, setData, setError);
      return { data, error };
    });

    expect(result.current.error).toBe('BroadcastChannel not supported');
  });

  it('should remove event listener on unmount', () => {
    const { unmount } = renderHook(() => {
      const [data, setData] = useState({});
      const [error, setError] = useState<string | null>(null);

      useBroadcastChannel(mockChannelName, data, setData, setError);
      return { data, setData, error };
    });

    unmount();
    expect(broadcastChannelMock.removeEventListener).toHaveBeenCalledTimes(2);
    expect(broadcastChannelMock.close).toHaveBeenCalledTimes(1);
  });
});
