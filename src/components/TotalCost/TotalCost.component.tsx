import { FC } from 'react';

import { Status } from 'types';
import classes from './TotalCost.module.css';

interface TotalCostProps {
  status: Status;
  error: string | null;
  total: number;
}

export const TotalCost: FC<TotalCostProps> = ({ status, error, total }) => {
  if (status === Status.PENDING) {
    return (
      <p className={classes['total-cost']}>Loading Total Cost of Launches...</p>
    );
  }

  if (status === Status.REJECTED) {
    return <p className={classes['total-cost']}>{error}</p>;
  }

  if (status === Status.RESOLVED) {
    return (
      <p className={classes['total-cost']}>Total Cost of Launches: ${total}</p>
    );
  }
};
