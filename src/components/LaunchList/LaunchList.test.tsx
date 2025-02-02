import { render, screen } from '@testing-library/react';

import { LaunchList } from 'components';
import { Launch, Status } from 'types';

describe('LaunchList Component', () => {
  const mockOnChangeLaunchCost = jest.fn();
  const mockOnChangePayloadType = jest.fn();

  const launchList: Launch[] = [
    {
      mission_name: 'Mission 1',
      flight_number: 1,
      launch_date_utc: '2023-01-02T10:00:00Z',
      rocket: {
        rocket_id: 'falcon9',
        cost_per_launch: 3000000,
        second_stage: {
          payloads: [
            { payload_id: 'p1', payload_type: 'Satellite' },
            { payload_id: 'p2', payload_type: 'Dragon' },
          ],
        },
      },
      cost: 3000000,
    },
    {
      mission_name: 'Mission 2',
      flight_number: 2,
      launch_date_utc: '2023-01-01T10:00:00Z',
      rocket: {
        rocket_id: 'falcon-heavy',
        cost_per_launch: 5000000,
        second_stage: {
          payloads: [{ payload_id: 'p3', payload_type: 'Crew' }],
        },
      },
      cost: 5000000,
    },
  ];

  it('renders launches in descending order of launch_date_utc', () => {
    render(
      <LaunchList
        launchList={launchList}
        costStatus={Status.RESOLVED}
        costError={null}
        onChangeLaunchCost={mockOnChangeLaunchCost}
        onChangePayloadType={mockOnChangePayloadType}
      />
    );

    const missionTitles = screen.getAllByRole('heading', { level: 3 });
    expect(missionTitles[0]).toHaveTextContent('Mission 1');
    expect(missionTitles[1]).toHaveTextContent('Mission 2');
  });

  it('calculates hoursSinceLastLaunch for each item except the last (descending order)', () => {
    render(
      <LaunchList
        launchList={launchList}
        costStatus={Status.RESOLVED}
        costError={null}
        onChangeLaunchCost={mockOnChangeLaunchCost}
        onChangePayloadType={mockOnChangePayloadType}
      />
    );

    expect(
      screen.getByText(/Hours Since Last Launch: 24/i)
    ).toBeInTheDocument();

    expect(
      screen.queryByText(/Hours Since Last Launch: /i)
    ).not.toHaveTextContent('Mission 2');
  });

  it('displays cost with provided costStatus and costError', () => {
    render(
      <LaunchList
        launchList={launchList}
        costStatus={Status.REJECTED}
        costError={'Failed to load rocket cost'}
        onChangeLaunchCost={mockOnChangeLaunchCost}
        onChangePayloadType={mockOnChangePayloadType}
      />
    );

    const errorMessages = screen.getAllByText('Failed to load rocket cost');
    errorMessages.forEach((errorMessage) =>
      expect(errorMessage).toBeInTheDocument()
    );
  });
});
