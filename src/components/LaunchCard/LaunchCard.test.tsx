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

    fireEvent.click(
      screen.getByRole('button', { name: /change cost of the launch/i })
    );

    expect(mockOnChangeLaunchCost).toHaveBeenCalledWith('falcon9', {
      cost_per_launch: 1000000,
    });
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
      name: /change payload type/i,
    });
    expect(buttons).toHaveLength(2);

    fireEvent.click(buttons[0]);
    expect(mockOnChangePayloadType).toHaveBeenCalledWith(
      '42-2023-01-01T10:00:00Z',
      'payload-1',
      { payload_type: 'Satellite' }
    );
  });

  it('shows a loading text if costStatus is PENDING', () => {
    const pendingProps = { ...defaultProps, costStatus: Status.PENDING };
    render(<LaunchCard {...pendingProps} />);
    expect(screen.getByText(/loading cost per launch/i)).toBeInTheDocument();
  });

  it('shows an error if costStatus is REJECTED', () => {
    const rejectedProps = {
      ...defaultProps,
      costStatus: Status.REJECTED,
      costError: 'Failed to load cost!',
    };
    render(<LaunchCard {...rejectedProps} />);
    expect(screen.getByText('Failed to load cost!')).toBeInTheDocument();
  });

  it('renders nothing in IDLE status for cost', () => {
    const idleProps = { ...defaultProps, costStatus: Status.IDLE };
    const { container } = render(<LaunchCard {...idleProps} />);
    expect(container).not.toHaveTextContent('Cost Per Launch');
  });
});
