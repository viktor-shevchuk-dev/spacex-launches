import { render, screen, fireEvent } from '@testing-library/react';
import { LaunchCard } from 'components';
import { Payload, Status } from 'types';

describe('LaunchCard Component', () => {
  const mockChangeCost = jest.fn();
  const mockChangePayload = jest.fn();

  const defaultProps = {
    launchId: '42-2023-01-01T10:00:00Z',
    missionName: 'Test Mission',
    flightNumber: 42,
    launchDateUTC: '2023-01-01T10:00:00Z',
    satelliteCount: 2,
    hoursSinceLastLaunch: 10,
    cost: 1000000,
    payloadList: [
      { payload_id: 'payload-1', payload_type: 'Dragon' },
      { payload_id: 'payload-2', payload_type: 'Satellite' },
    ] as Payload[],
    rocketId: 'falcon9',
    costStatus: Status.RESOLVED,
    costError: null,
    onChangeLaunchCost: mockChangeCost,
    onChangePayloadType: mockChangePayload,
  };

  it('renders mission, flight number, date, satellite count and hours since last launch', () => {
    render(<LaunchCard {...defaultProps} />);

    expect(screen.getByText('Test Mission')).toBeInTheDocument();
    expect(screen.getByText('Flight Number: 42')).toBeInTheDocument();
    expect(screen.getByText('Launch Date: 01.01.2023')).toBeInTheDocument();
    expect(screen.getByText('Satellites: 2')).toBeInTheDocument();
    expect(screen.getByText('Hours Since Last Launch: 10')).toBeInTheDocument();
  });

  it('does not render hours since last launch when null', () => {
    render(<LaunchCard {...defaultProps} hoursSinceLastLaunch={null} />);
    expect(
      screen.queryByText(/Hours Since Last Launch/)
    ).not.toBeInTheDocument();
  });

  it('renders cost in RESOLVED state and a button to change the cost', () => {
    render(<LaunchCard {...defaultProps} />);
    expect(screen.getByText('Cost Per Launch: $1000000')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /change cost of the launch/i })
    ).toBeInTheDocument();
  });

  it('calls onChangeLaunchCost when clicking "Change cost of the launch" button', () => {
    const mockOnChangeLaunchCost = jest.fn();
    render(
      <LaunchCard
        {...defaultProps}
        onChangeLaunchCost={mockOnChangeLaunchCost}
      />
    );
    const button = screen.getByRole('button', {
      name: 'Change cost of the launch',
    });
    fireEvent.click(button);

    expect(mockOnChangeLaunchCost).toHaveBeenCalledWith('falcon9', {
      cost_per_launch: 1000000,
    });
  });

  it('renders all payload items correctly', () => {
    render(<LaunchCard {...defaultProps} />);
    expect(screen.getByText('Payload Type: Satellite')).toBeInTheDocument();
    expect(screen.getByText('Payload Type: Dragon')).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: 'Change payload type' })
    ).toHaveLength(2);
  });

  it('calls onChangePayloadType when clicking "Change payload type" button', () => {
    const mockOnChangePayloadType = jest.fn();
    render(
      <LaunchCard
        {...defaultProps}
        onChangePayloadType={mockOnChangePayloadType}
      />
    );

    const buttons = screen.getAllByRole('button', {
      name: 'Change payload type',
    });
    expect(buttons).toHaveLength(2);

    fireEvent.click(buttons[0]);
    expect(mockOnChangePayloadType).toHaveBeenCalledWith(
      '42-2023-01-01T10:00:00Z',
      'payload-1',
      { payload_type: 'Satellite' }
    );
  });

  test('handles empty payload list', () => {
    render(<LaunchCard {...defaultProps} payloadList={[]} />);
    expect(screen.queryByText(/Payload Type:/)).not.toBeInTheDocument();
  });
});
