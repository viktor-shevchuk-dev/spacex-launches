import { render, screen } from '@testing-library/react';
import { TotalCost } from 'components';
import { Status } from 'types';

describe('TotalCost Component', () => {
  const defaultProps = {
    label: 'Total Cost',
    value: 42,
    error: null,
    isSummary: false,
    children: null,
  };

  it('displays loading text in PENDING state', () => {
    render(<TotalCost {...defaultProps} status={Status.PENDING} />);
    expect(screen.getByText(/loading total cost.../i)).toBeInTheDocument();
  });

  it('displays error text in REJECTED state', () => {
    render(
      <TotalCost
        {...defaultProps}
        status={Status.REJECTED}
        error="Unable to fetch cost"
      />
    );
    expect(screen.getByText('Unable to fetch cost')).toBeInTheDocument();
  });

  it('displays cost in RESOLVED state', () => {
    render(<TotalCost {...defaultProps} status={Status.RESOLVED} />);
    expect(screen.getByText('Total Cost: $42')).toBeInTheDocument();
  });

  it('renders nothing in IDLE state', () => {
    const { container } = render(
      <TotalCost {...defaultProps} status={Status.IDLE} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders children when in RESOLVED state', () => {
    render(
      <TotalCost {...defaultProps} status={Status.RESOLVED}>
        <button>Child Button</button>
      </TotalCost>
    );

    expect(screen.getByText('Total Cost: $42')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /child button/i })
    ).toBeInTheDocument();
  });
});
