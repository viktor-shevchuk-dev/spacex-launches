import { FC } from 'react';
import { parseISO, format } from 'date-fns';

import classes from './LaunchCard.module.css';
import {
  Cost,
  Payload,
  ChangeLaunchCostHandler,
  ChangePayloadTypeHandler,
} from 'types';
import { TotalCost, Button } from 'components';

interface LaunchCardProps {
  launchId: string;
  missionName: string;
  flightNumber: number;
  launchDateUTC: string;
  satelliteCount: number;
  hoursSinceLastLaunch: number | null;
  cost: Cost;
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
        status={cost.status}
        error={cost.error}
        value={cost.value}
        label="Cost Per Launch"
      >
        <Button
          primary
          onClick={onChangeLaunchCost.bind(null, rocketId, {
            cost_per_launch: 1000000,
          })}
        >
          Change cost of the launch
        </Button>
      </TotalCost>

      <ul className={classes['payload-list']}>
        {payloadList.map(
          ({ payload_id: payloadId, payload_type: payloadType }) => {
            return (
              <li key={payloadId} className={classes.payload}>
                <p className={classes.description}>
                  Payload Type: {payloadType}
                </p>
                <Button
                  primary
                  inverted
                  onClick={onChangePayloadType.bind(null, launchId, payloadId, {
                    payload_type: 'Satellite',
                  })}
                >
                  Change payload type
                </Button>
              </li>
            );
          }
        )}
      </ul>
    </li>
  );
};
