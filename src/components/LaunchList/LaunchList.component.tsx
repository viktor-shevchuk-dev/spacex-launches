import { FC } from 'react';

import { LaunchCard, ErrorBoundary } from 'components';
import { Launch, Status, RocketCostMap } from 'types';

import classes from './LaunchList.module.css';
import { getDifferenceBetweenUTCDatesInHours } from 'utils';

interface LaunchListProps {
  launchList: Launch[];
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

export const LaunchList: FC<LaunchListProps> = ({
  launchList,
  onChangeLaunchCost,
  onChangePayloadType,
}) => {
  const sortedLaunchList = launchList.toSorted((a, b) =>
    b.launch_date_utc.localeCompare(a.launch_date_utc)
  );

  return (
    <ErrorBoundary>
      <ul className={classes['launch-list']}>
        {sortedLaunchList.map(
          (
            {
              flight_number,
              mission_name,
              launch_date_utc,
              rocket: {
                second_stage: { payloads: payloadList },
                rocket_id: rocketId,
              },
              cost,
            },
            index
          ) => {
            const satelliteCount = payloadList.reduce(
              (accumulator, payload) =>
                payload.payload_type === 'Satellite'
                  ? accumulator + 1
                  : accumulator,
              0
            );

            let hoursSinceLastLaunch: number | null = null;
            const isNotLastLaunch = index < launchList.length - 1;

            if (isNotLastLaunch) {
              const nextLaunch = sortedLaunchList[index + 1];
              hoursSinceLastLaunch = getDifferenceBetweenUTCDatesInHours(
                launch_date_utc,
                nextLaunch.launch_date_utc
              );
            }
            const launchId = `${flight_number}-${launch_date_utc}`;

            return (
              <LaunchCard
                key={launchId}
                id={launchId}
                missionName={mission_name}
                flightNumber={flight_number}
                launchDate={launch_date_utc}
                satelliteCount={satelliteCount}
                hoursSinceLastLaunch={hoursSinceLastLaunch}
                cost={cost}
                rocketId={rocketId}
                payloadList={payloadList}
                onChangeLaunchCost={onChangeLaunchCost}
                onChangePayloadType={onChangePayloadType}
              />
            );
          }
        )}
      </ul>
    </ErrorBoundary>
  );
};
