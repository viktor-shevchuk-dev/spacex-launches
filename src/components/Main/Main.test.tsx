import { render, screen, fireEvent } from '@testing-library/react';
import { Main } from 'components';
import { useLaunches, useRocketCosts } from 'hooks';
import { Status } from 'types';

jest.mock('../../hooks/useLaunches.hook');
jest.mock('../../hooks/useRocketCosts.hook');

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
});
