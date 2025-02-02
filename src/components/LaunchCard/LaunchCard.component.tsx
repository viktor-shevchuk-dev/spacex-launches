import { FC } from 'react';
import { parseISO, format } from 'date-fns';

import classes from './LaunchCard.module.css';
import {
  Payload,
  ChangeLaunchCostHandler,
  ChangePayloadTypeHandler,
  Status,
} from 'types';
import { TotalCost, Button, PayloadList } from 'components';

interface LaunchCardProps {
  launchId: string;
  missionName: string;
  flightNumber: number;
  launchDateUTC: string;
  satelliteCount: number;
  hoursSinceLastLaunch: number | null;
  cost: number;
  costStatus: Status;
  costError: null | string;
  rocketId: string;
  payloadList: Payload[];
  onChangeLaunchCost: ChangeLaunchCostHandler;
  onChangePayloadType: ChangePayloadTypeHandler;
}

export const LaunchCard: FC<LaunchCardProps> = ({
  launchId,
  missionName,
  flightNumber,
  launchDateUTC,
  satelliteCount,
  hoursSinceLastLaunch,
  cost,
  payloadList,
  rocketId,
  costStatus,
  costError,
  onChangeLaunchCost,
  onChangePayloadType,
}) => {
  return (
    <li className={classes['launch-card']}>
      <h3 className={classes.title}>{missionName}</h3>
      <div className={classes['description-container']}>
        <p className={classes.description}>Flight Number: {flightNumber}</p>
        <p className={classes.description}>
          Launch Date: {format(parseISO(launchDateUTC), 'MM.dd.yyyy')}
        </p>
        <p className={classes.description}>Satellites: {satelliteCount}</p>
        {hoursSinceLastLaunch !== null && (
          <p className={classes.description}>
            Hours Since Last Launch: {hoursSinceLastLaunch}
          </p>
        )}
      </div>

      <TotalCost
        status={costStatus}
        error={costError}
        value={cost}
        label="Cost Per Launch"
      >
        <Button
          primary
          onClick={() =>
            onChangeLaunchCost(rocketId, { cost_per_launch: 1000000 })
          }
        >
          Change cost of the launch
        </Button>
      </TotalCost>

      <PayloadList
        launchId={launchId}
        payloadList={payloadList}
        onChangePayloadType={onChangePayloadType}
      />
    </li>
  );
};
