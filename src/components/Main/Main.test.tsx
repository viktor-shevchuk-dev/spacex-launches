import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { Main } from 'components';
import { useLaunches, useRocketCosts } from 'hooks';
import { Status } from 'types';
import * as API from 'services';

jest.mock('../../hooks/useLaunches.hook');
jest.mock('../../hooks/useRocketCosts.hook');

jest.mock('services', () => ({
  ...jest.requireActual('services'),
  editRocket: jest.fn(),
  editPayload: jest.fn(),
}));

describe('Main Component Integration', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders loading state when data is being fetched', () => {
    (useLaunches as jest.Mock).mockReturnValue({
      launchList: [],
      status: Status.PENDING,
      error: null,
      setLaunchList: jest.fn(),
    });

    (useRocketCosts as jest.Mock).mockReturnValue({
      rocketCostMap: {},
      status: Status.IDLE,
      error: null,
      setRocketCostMap: jest.fn(),
    });

    render(<Main />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays error when launch fetch fails', () => {
    (useLaunches as jest.Mock).mockReturnValue({
      launchList: [],
      status: Status.REJECTED,
      error: 'Failed to load launches!',
      setLaunchList: jest.fn(),
    });

    (useRocketCosts as jest.Mock).mockReturnValue({
      rocketCostMap: {},
      status: Status.IDLE,
      error: null,
      setRocketCostMap: jest.fn(),
    });

    render(<Main />);

    expect(screen.getByText('Failed to load launches!')).toBeInTheDocument();
  });

  it('displays total cost and the launch list once data is resolved', () => {
    (useLaunches as jest.Mock).mockReturnValue({
      launchList: [
        {
          mission_name: 'Mock Mission',
          flight_number: 10,
          launch_date_utc: '2023-01-01T00:00:00Z',
          rocket: {
            rocket_id: 'falcon9',
            cost_per_launch: 1234,
            second_stage: { payloads: [] },
          },
          cost: 1234,
        },
      ],
      status: Status.RESOLVED,
      error: null,
      setLaunchList: jest.fn(),
    });

    (useRocketCosts as jest.Mock).mockReturnValue({
      rocketCostMap: { falcon9: 1234 },
      status: Status.RESOLVED,
      error: null,
      setRocketCostMap: jest.fn(),
    });

    render(<Main />);

    expect(
      screen.getByText('Total Cost of Launches: $1234')
    ).toBeInTheDocument();
    expect(screen.getByText('Mock Mission')).toBeInTheDocument();
  });

  it('updates cost when "Change cost of the launch" is clicked', () => {
    const mockSetRocketCostMap = jest.fn();
    const mockSetLaunchList = jest.fn();

    (useLaunches as jest.Mock).mockReturnValue({
      launchList: [
        {
          mission_name: 'Mock Mission',
          flight_number: 10,
          launch_date_utc: '2023-01-01T00:00:00Z',
          rocket: {
            rocket_id: 'falcon9',
            cost_per_launch: 1000,
            second_stage: { payloads: [] },
          },
          cost: 1000,
        },
      ],
      status: Status.RESOLVED,
      error: null,
      setLaunchList: mockSetLaunchList,
    });

    (useRocketCosts as jest.Mock).mockReturnValue({
      rocketCostMap: { falcon9: 1000 },
      status: Status.RESOLVED,
      error: null,
      setRocketCostMap: mockSetRocketCostMap,
    });

    render(<Main />);

    expect(
      screen.getByText('Total Cost of Launches: $1000')
    ).toBeInTheDocument();

    const changeCostButton = screen.getByRole('button', {
      name: /change cost of the launch/i,
    });
    fireEvent.click(changeCostButton);

    expect(mockSetRocketCostMap).toHaveBeenCalledTimes(1);
    expect(mockSetRocketCostMap).toHaveBeenCalledWith(expect.any(Function));
  });

  it('rolls back rocket cost on API failure after user confirmation', async () => {
    const originalCost = 1000;
    const mockSetRocketCostMap = jest.fn();

    (useLaunches as jest.Mock).mockReturnValue({
      launchList: [
        {
          mission_name: 'Test Mission',
          flight_number: 1,
          launch_date_utc: '2023-01-01T00:00:00Z',
          rocket: {
            rocket_id: 'falcon9',
            cost_per_launch: originalCost,
            second_stage: { payloads: [] },
          },
          cost: originalCost,
        },
      ],
      status: Status.RESOLVED,
      error: null,
      setLaunchList: jest.fn(),
    });

    (useRocketCosts as jest.Mock).mockReturnValue({
      rocketCostMap: { falcon9: originalCost },
      status: Status.RESOLVED,
      error: null,
      setRocketCostMap: mockSetRocketCostMap,
    });

    (API.editRocket as jest.Mock).mockRejectedValue(
      new Error('Edit rocket failed!')
    );

    window.confirm = jest.fn(() => true);

    render(<Main />);

    const btn = screen.getByRole('button', {
      name: /change cost of the launch/i,
    });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(mockSetRocketCostMap).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      const revertFunction = mockSetRocketCostMap.mock.calls[1][0];
      const revertResult = revertFunction({ falcon9: 2000 });
      expect(revertResult).toEqual({ falcon9: originalCost });
    });
  });

  it('rolls back payload type change on API failure after user confirmation', async () => {
    const mockSetLaunchList = jest.fn();
    const mockSetRocketCostMap = jest.fn();

    const originalPayloadType = 'Satellite';

    (useLaunches as jest.Mock).mockReturnValue({
      launchList: [
        {
          mission_name: 'Test Mission',
          flight_number: 1,
          launch_date_utc: '2023-01-01T00:00:00Z',
          cost: 1000,
          rocket: {
            rocket_id: 'falcon9',
            cost_per_launch: 1000,
            second_stage: {
              payloads: [
                { payload_id: 'p1', payload_type: originalPayloadType },
              ],
            },
          },
        },
      ],
      status: Status.RESOLVED,
      error: null,
      setLaunchList: mockSetLaunchList,
    });

    (useRocketCosts as jest.Mock).mockReturnValue({
      rocketCostMap: { falcon9: 1000 },
      status: Status.RESOLVED,
      error: null,
      setRocketCostMap: mockSetRocketCostMap,
    });

    (API.editPayload as jest.Mock).mockRejectedValue(
      new Error('Edit payload type failed!')
    );
    window.confirm = jest.fn(() => true);

    render(<Main />);

    const changePayloadBtn = screen.getByRole('button', {
      name: /change payload type/i,
    });
    fireEvent.click(changePayloadBtn);

    await waitFor(() => {
      expect(mockSetLaunchList).toHaveBeenCalledTimes(2);
    });

    const revertFunction = mockSetLaunchList.mock.calls[1][0];
    const prevLaunches = [
      {
        mission_name: 'Test Mission',
        flight_number: 1,
        launch_date_utc: '2023-01-01T00:00:00Z',
        rocket: {
          rocket_id: 'falcon9',
          cost_per_launch: 1000,
          second_stage: {
            payloads: [{ payload_id: 'payload-1', payload_type: 'NewType' }],
          },
        },
        cost: 1000,
      },
    ];
    const revertedLaunches = revertFunction(prevLaunches);
    await waitFor(() => {
      expect(
        revertedLaunches[0].rocket.second_stage.payloads[0].payload_type
      ).toBe('Satellite');
    });
  });
});
