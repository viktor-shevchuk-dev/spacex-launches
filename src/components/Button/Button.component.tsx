import { FC, MouseEventHandler, ComponentPropsWithoutRef } from 'react';
import classNames from 'classnames/bind';

import classes from './Button.module.css';

interface ButtonProps
  extends Omit<
    ComponentPropsWithoutRef<'button'>,
    'type' | 'onClick' | 'className'
  > {
  children: React.ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  extraClassName?: string;
  primary?: boolean;
  secondary?: boolean;
}

export const Button: FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  extraClassName = '',
  primary,
  secondary,
  ...props
}) => (
  <button
    type={type}
    className={classNames.bind(classes)('button', {
      [extraClassName]: extraClassName,
      primary,
      secondary,
    })}
    onClick={onClick}
    {...props}
  >
    {children}
  </button>
);
