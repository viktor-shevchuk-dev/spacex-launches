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

      <button
        type="button"
        onClick={onChangeLaunchCost.bind(null, rocketId, {
          cost_per_launch: 1000000,
        })}
      >
        Change cost of the launch
      </button>

      <ul>
        {payloadList.map((payload) => {
          return (
            <li key={payload.payload_id}>
              <p>Payload Type: {payload.payload_type}</p>
              <button
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
