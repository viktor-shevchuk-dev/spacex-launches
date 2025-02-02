import { renderHook, waitFor, act } from '@testing-library/react';
import { useRocketCosts } from 'hooks';
import * as API from '../services';
import { Status } from '../types';

jest.mock('../services');

const mockLaunches = [
  {
    mission_name: 'Test Mission',
    flight_number: 1,
    launch_date_utc: '2020-01-01T00:00:00.000Z',
    rocket: {
      rocket_id: 'falcon1',
      cost_per_launch: 0,
      second_stage: { payloads: [] },
    },
    cost: 0,
  },
];

const originalBroadcastChannel = global.BroadcastChannel;

describe('useRocketCosts', () => {
  let broadcastChannelMock: {
    postMessage: jest.Mock;
    close: jest.Mock;
    addEventListener: jest.Mock;
    removeEventListener: jest.Mock;
  };

  beforeEach(() => {
    window.localStorage.clear();

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

  it('fetches rocket costs and builds cost map', async () => {
    const mockRockets = [
      { rocket_id: 'falcon1', cost_per_launch: 1000000 },
      { rocket_id: 'falcon9', cost_per_launch: 5000000 },
    ];
    (API.fetchRocket as jest.Mock)
      .mockResolvedValueOnce(mockRockets[0])
      .mockResolvedValueOnce(mockRockets[1]);

    const { result } = renderHook(() => useRocketCosts(mockLaunches));

    await waitFor(() => expect(result.current.status).toBe(Status.RESOLVED), {
      timeout: 4000,
    });

    expect(result.current.rocketCostMap).toEqual({ falcon1: 1000000 });
  });

  it('handles fetch errors', async () => {
    (API.fetchRocket as jest.Mock).mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useRocketCosts(mockLaunches));

    await waitFor(() => expect(result.current.status).toBe(Status.REJECTED));
    expect(result.current.error).toBe('API Error');
  });

  it('updates from broadcast channel', async () => {
    const { result } = renderHook(() => useRocketCosts([]));
    const newCosts = { falcon9: 6000000 };

    // Simulate broadcast message
    const messageCalls = broadcastChannelMock.addEventListener.mock.calls;
    const messageHandler = messageCalls.find(
      (call) => call[0] === 'message'
    )?.[1];
    expect(messageHandler).toBeDefined();

    act(() => {
      messageHandler!({ data: newCosts });
    });

    await waitFor(() => {
      expect(result.current.rocketCostMap).toEqual(newCosts);
    });
  });
});
