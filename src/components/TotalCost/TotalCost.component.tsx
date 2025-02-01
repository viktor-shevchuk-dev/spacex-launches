import { FC, ReactNode } from 'react';
import classNames from 'classnames/bind';

import { Status } from 'types';
import classes from './TotalCost.module.css';

interface TotalCostProps {
  status: Status;
  error: string | null;
  value: number;
  label: string;
  large?: boolean;
  children?: ReactNode;
}

export const TotalCost: FC<TotalCostProps> = ({
  status,
  error,
  value,
  label,
  large,
  children,
}) => {
  const textClasses = classNames.bind(classes)('cost', {
    large,
  });

  switch (status) {
    case Status.PENDING:
      return <p className={textClasses}>Loading {label}...</p>;
    case Status.REJECTED:
      return <p className={textClasses}>{error}</p>;
    case Status.RESOLVED:
      return (
        <div className={classes['cost-container']}>
          <p className={textClasses}>
            {label}: ${value}
          </p>
          {children}
        </div>
      );
    default:
      return null;
  }
};
