import { FC } from 'react';

import {
  Launch,
  ChangeLaunchCostHandler,
  ChangePayloadTypeHandler,
} from 'types';
import { getDifferenceBetweenUTCDatesInHours } from 'utils';
import { LaunchCard, ErrorBoundary } from 'components';

import classes from './LaunchList.module.css';

interface LaunchListProps {
  launchList: Launch[];
  onChangeLaunchCost: ChangeLaunchCostHandler;
  onChangePayloadType: ChangePayloadTypeHandler;
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
              mission_name: missionName,
              flight_number: flightNumber,
              launch_date_utc: launchDateUTC,
              rocket: {
                second_stage: { payloads: payloadList },
                rocket_id: rocketId,
              },
              cost,
            },
            index
          ) => {
            const satelliteCount = payloadList.reduce(
              (accumulator, { payload_type: payloadType }) =>
                payloadType === 'Satellite' ? accumulator + 1 : accumulator,
              0
            );

            const hoursSinceLastLaunch =
              index < launchList.length - 1
                ? getDifferenceBetweenUTCDatesInHours(
                    launchDateUTC,
                    sortedLaunchList[index + 1].launch_date_utc
                  )
                : null;

            const launchId = `${flightNumber}-${launchDateUTC}`;

            return (
              <LaunchCard
                key={launchId}
                launchId={launchId}
                missionName={missionName}
                flightNumber={flightNumber}
                launchDateUTC={launchDateUTC}
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
