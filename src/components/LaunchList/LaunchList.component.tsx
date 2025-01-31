import { FC, useState, useEffect } from 'react';

import { LaunchCard, ErrorBoundary } from 'components';
import { Launch, Status, RocketCostMap } from 'types';
import { fetchLaunchList, fetchRocket } from 'services';

import classes from './LaunchList.module.css';
import { getDifferenceBetweenUTCDatesInHours } from 'utils';

interface LaunchListProps {
  launchList: Launch[];
}

export const LaunchList: FC<LaunchListProps> = ({ launchList }) => {
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
                second_stage: { payloads },
              },
              cost,
            },
            index
          ) => {
            const satelliteCount = payloads.reduce(
              (accumulator, payload) =>
                payload.payload_type === 'Satellite' ? 1 : 0 + accumulator,
              0
            );

            let hoursSinceLastLaunch: number | null = null;
            if (index < launchList.length - 1) {
              const nextLaunch = sortedLaunchList[index + 1];
              hoursSinceLastLaunch = Math.abs(
                getDifferenceBetweenUTCDatesInHours(
                  launch_date_utc,
                  nextLaunch.launch_date_utc
                )
              );
            }

            return (
              <LaunchCard
                key={`${flight_number}-${launch_date_utc}`}
                missionName={mission_name}
                flightNumber={flight_number}
                launchDate={launch_date_utc}
                satelliteCount={satelliteCount}
                hoursSinceLastLaunch={hoursSinceLastLaunch}
                cost={cost}
              />
            );
          }
        )}
      </ul>
    </ErrorBoundary>
  );
};
