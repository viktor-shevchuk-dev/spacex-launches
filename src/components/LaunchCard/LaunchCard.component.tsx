import { FC } from 'react';

import { parseISO, format } from 'date-fns';

import classes from './LaunchCard.module.css';
import { Cost, Status } from 'types';

interface LaunchCardProps {
  missionName: string;
  flightNumber: number;
  launchDate: string;
  satelliteCount: number;
  hoursSinceLastLaunch: number | null;
  cost: Cost;
}

export const LaunchCard: FC<LaunchCardProps> = ({
  missionName,
  flightNumber,
  launchDate,
  satelliteCount,
  hoursSinceLastLaunch,
  cost,
}) => {
  const formattedLaunchDate = format(parseISO(launchDate), 'MM.dd.yyyy');

  return (
    <li className={classes.card}>
      <h3>{missionName}</h3>
      <p>Flight Number: {flightNumber}</p>
      <p>Launch Date: {formattedLaunchDate}</p>
      <p>Satellites: {satelliteCount}</p>
      {hoursSinceLastLaunch && (
        <p>Hours Since Last Launch: {hoursSinceLastLaunch}</p>
      )}

      {cost.status === Status.PENDING && <p>Loading Cost...</p>}
      {cost.status === Status.REJECTED && <p>{cost.error}</p>}
      {cost.status === Status.RESOLVED && <p>Cost Per Launch: ${cost.value}</p>}
    </li>
  );
};
