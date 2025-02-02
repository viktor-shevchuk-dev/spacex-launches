import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from 'components';

const ProblemChild = () => {
  throw new Error('Oops!');
};

describe('ErrorBoundary', () => {
  it('catches errors and displays the fallback UI', () => {
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(
      screen.getByText(/Sth wen wrong\. Try again later\./i)
    ).toBeInTheDocument();
  });
});
