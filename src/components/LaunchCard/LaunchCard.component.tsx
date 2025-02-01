import { FC } from 'react';

import { parseISO, format } from 'date-fns';

import classes from './LaunchCard.module.css';
import { Cost, Status, Payload } from 'types';

interface LaunchCardProps {
  id: string;
  missionName: string;
  flightNumber: number;
  launchDate: string;
  satelliteCount: number;
  hoursSinceLastLaunch: number | null;
  cost: Cost;
  rocketId: string;
  payloadList: Payload[];
  onChangeLaunchCost: (
    rocketId: string,
    field: { cost_per_launch: number }
  ) => void;
  onChangePayloadType: (
    launchId: string,
    payloadId: string,
    field: { payload_type: string }
  ) => void;
}

export const LaunchCard: FC<LaunchCardProps> = ({
  id,
  missionName,
  flightNumber,
  launchDate,
  satelliteCount,
  hoursSinceLastLaunch,
  cost,
  payloadList,
  rocketId,
  onChangeLaunchCost,
  onChangePayloadType,
}) => {
  const formattedLaunchDate = format(parseISO(launchDate), 'MM.dd.yyyy');

  return (
    <li className={classes['launch-card']}>
      <h3 className={classes.title}>{missionName}</h3>
      <div className={classes['description-container']}>
        <p className={classes.description}>Flight Number: {flightNumber}</p>
        <p className={classes.description}>
          Launch Date: {formattedLaunchDate}
        </p>
        <p className={classes.description}>Satellites: {satelliteCount}</p>
        {hoursSinceLastLaunch && (
          <p className={classes.description}>
            Hours Since Last Launch: {hoursSinceLastLaunch}
          </p>
        )}
      </div>

      {cost.status === Status.PENDING && (
        <p className={classes.description}>Loading Cost...</p>
      )}
      {cost.status === Status.REJECTED && (
        <p className={classes.description}>{cost.error}</p>
      )}
      {cost.status === Status.RESOLVED && (
        <div className={classes['cost-container']}>
          <p className={classes.description}>Cost Per Launch: ${cost.value}</p>
          <button
            className={`${classes.button} ${classes.primary}`}
            type="button"
            onClick={onChangeLaunchCost.bind(null, rocketId, {
              cost_per_launch: 1000000,
            })}
          >
            Change cost of the launch
          </button>
        </div>
      )}

      <ul className={classes['payload-list']}>
        {payloadList.map((payload) => {
          return (
            <li key={payload.payload_id} className={classes.payload}>
              <p className={classes.description}>
                Payload Type: {payload.payload_type}
              </p>
              <button
                className={`${classes.button} ${classes.secondary}`}
                type="button"
                onClick={onChangePayloadType.bind(
                  null,
                  id,
                  payload.payload_id,
                  {
                    payload_type: 'Satellite',
                  }
                )}
              >
                Change payload type
              </button>
            </li>
          );
        })}
      </ul>
    </li>
  );
};
