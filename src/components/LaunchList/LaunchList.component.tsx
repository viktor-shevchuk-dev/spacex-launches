import { FC, useState, useEffect } from 'react';

import { LaunchCard } from 'components';
import { Launch, Status, RocketCostMap } from 'types';
import { fetchLaunchList, fetchRocket } from 'services';

import classes from './LaunchList.module.css';
import { getDifferenceBetweenUTCDatesInHours } from 'utils';

interface LaunchListProps {
  launchList: Launch[];
}

export const LaunchList: FC<LaunchListProps> = ({ launchList }) => {
  return (
    <ul className={classes['launch-list']}>
      {launchList.map(
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
          if (index > 0) {
            const prevLaunch = launchList[index - 1];
            hoursSinceLastLaunch = getDifferenceBetweenUTCDatesInHours(
              prevLaunch.launch_date_utc,
              launch_date_utc
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
  );
};
