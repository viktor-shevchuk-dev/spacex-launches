import { renderHook, waitFor } from '@testing-library/react';
import { useLaunches } from 'hooks';
import * as API from 'services';
import { Status } from 'types';

jest.mock('services');

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

describe('useLaunches', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  it('fetches launches and updates state', async () => {
    (API.fetchLaunchList as jest.Mock).mockResolvedValue(mockLaunches);

    const { result } = renderHook(() => useLaunches());
    expect(result.current.status).toBe(Status.PENDING);

    await waitFor(() => expect(result.current.status).toBe(Status.RESOLVED));

    expect(result.current.launchList).toEqual(mockLaunches);
    expect(window.localStorage.getItem('launchList')).toEqual(
      JSON.stringify(mockLaunches)
    );
  });

  it('handles fetch error', async () => {
    (API.fetchLaunchList as jest.Mock).mockRejectedValue(
      new Error('API Error')
    );

    const { result } = renderHook(() => useLaunches());

    await waitFor(() => expect(result.current.status).toBe(Status.REJECTED));
    expect(result.current.error).toBe('API Error');
  });

  it('uses cached launches', () => {
    window.localStorage.setItem('launchList', JSON.stringify(mockLaunches));

    const { result } = renderHook(() => useLaunches());

    expect(result.current.status).toBe(Status.RESOLVED);
    expect(result.current.launchList).toEqual(mockLaunches);
    expect(API.fetchLaunchList).not.toHaveBeenCalled();
  });
});
