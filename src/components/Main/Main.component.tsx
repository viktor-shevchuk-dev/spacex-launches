import { FC, useState, useEffect, useCallback } from 'react';

import { LaunchList } from 'components';
import { Launch, Status, RocketCostMap } from 'types';
import * as API from 'services';
import { useBroadcastChannel, useLocalStorage } from 'hooks';
import classes from './Main.module.css';

export const Main: FC = () => {
  const [launchList, setLaunchList] = useLocalStorage<Launch[]>(
    'launchList',
    []
  );
  const [launchListStatus, setLaunchListStatus] = useState<Status>(() =>
    launchList.length ? Status.RESOLVED : Status.IDLE
  );
  const [launchListError, setLaunchListError] = useState<string | null>(null);

  const [rocketCostMap, setRocketCostMap] = useLocalStorage<RocketCostMap>(
    'rocketCostMap',
    {}
  );
  const [rocketCostMapStatus, setRocketCostMapStatus] = useState<Status>(() =>
    Object.entries(rocketCostMap).length ? Status.RESOLVED : Status.PENDING
  );
  const [rocketCostMapError, setRocketCostMapError] = useState<string | null>(
    null
  );

  useBroadcastChannel(
    'rocket-cost-channel',
    rocketCostMap,
    setRocketCostMap,
    setRocketCostMapError
  );

  const fetchLaunchListHandler = useCallback(async () => {
    try {
      if (!launchList.length) {
        setLaunchListStatus(Status.PENDING);
        const freshlaunchList = await API.fetchLaunchList();
        setTimeout(() => {
          setLaunchList(freshlaunchList);
          setLaunchListStatus(Status.RESOLVED);
        }, 500);
      }
    } catch (error) {
      const message = (error as Error).message;
      setLaunchListError(message);
      setLaunchListStatus(Status.REJECTED);
    }
  }, [launchList.length, setLaunchList]);

  const fetchRocketListHandler = useCallback(async () => {
    try {
      if (launchList.length && !Object.entries(rocketCostMap).length) {
        setRocketCostMapStatus(Status.PENDING);
        const rocketIdList = Array.from(
          new Set(launchList.map((launch) => launch.rocket.rocket_id))
        );
        const rocketPromiseList = rocketIdList.map(API.fetchRocket);
        const freshRocketList = await Promise.all(rocketPromiseList);
        const newRocketCostMap = freshRocketList.reduce(
          (map: RocketCostMap, rocket) => {
            map[rocket.rocket_id] = rocket.cost_per_launch;
            return map;
          },
          {}
        );

        setTimeout(() => {
          setRocketCostMap(newRocketCostMap);
          setRocketCostMapStatus(Status.RESOLVED);
        }, 3000);
      }
    } catch (error) {
      const message = (error as Error).message;
      setRocketCostMapError(message);
      setRocketCostMapStatus(Status.REJECTED);
    }
  }, [launchList, rocketCostMap, setRocketCostMap]);

  useEffect(() => {
    fetchLaunchListHandler();
  }, [fetchLaunchListHandler]);

  useEffect(() => {
    fetchRocketListHandler();
  }, [fetchRocketListHandler]);

  const launchListWithRocketCost = launchList.map((launch) => ({
    ...launch,
    cost: {
      status: rocketCostMapStatus,
      error: rocketCostMapError,
      value: rocketCostMap[launch.rocket.rocket_id],
    },
  }));

  const changeLaunchCost = async (
    rocketId: string,
    field: { cost_per_launch: number }
  ) => {
    const originalCost = rocketCostMap[rocketId];

    try {
      setRocketCostMap((prevRocketCostMap) => ({
        ...prevRocketCostMap,
        [rocketId]: field.cost_per_launch,
      }));
      await API.editRocket(rocketId, field);
    } catch (error) {
      const message = (error as Error).message;
      if (!window.confirm(`Error: ${message}. Rollback changes?`)) {
        return;
      }

      setRocketCostMap((prevRocketCostMap) => ({
        ...prevRocketCostMap,
        [rocketId]: originalCost,
      }));
    }
  };

  const changePayloadType = async (
    launchId: string,
    payloadId: string,
    field: { payload_type: string }
  ) => {
    const originalLaunch = launchList.find(
      (launch) =>
        `${launch.flight_number}-${launch.launch_date_utc}` === launchId
    );

    try {
      setLaunchList((prev) =>
        prev.map((launch) => {
          if (`${launch.flight_number}-${launch.launch_date_utc}` !== launchId)
            return launch;

          return {
            ...launch,
            rocket: {
              ...launch.rocket,
              second_stage: {
                ...launch.rocket.second_stage,
                payloads: launch.rocket.second_stage.payloads.map((payload) =>
                  payload.payload_id === payloadId
                    ? { ...payload, payload_type: field.payload_type }
                    : payload
                ),
              },
            },
          };
        })
      );
      await API.editPayload(payloadId, field);
    } catch (error) {
      const message = (error as Error).message;
      if (!window.confirm(`Error: ${message}. Rollback changes?`)) {
        return;
      }

      setLaunchList((prev) =>
        prev.map((launch) => {
          if (`${launch.flight_number}-${launch.launch_date_utc}` !== launchId)
            return launch;
          return originalLaunch ? originalLaunch : launch;
        })
      );
    }
  };

  const totalCost = launchListWithRocketCost.reduce(
    (sum, launch) => sum + launch.cost.value,
    0
  );
  console.log({ launchListStatus, rocketCostMapStatus });

  return (
    <main>
      <div className={`container ${classes['launch-shelf']}`}>
        {launchListStatus === Status.PENDING && (
          <p className={classes.loading}>Loading...</p>
        )}
        {launchListStatus === Status.REJECTED && <p>{launchListError}</p>}
        {launchListStatus === Status.RESOLVED && (
          <>
            {rocketCostMapStatus === Status.PENDING && (
              <p className={classes['total-cost']}>
                Loading Total Cost of Launches...
              </p>
            )}
            {rocketCostMapStatus === Status.REJECTED && (
              <p className={classes['total-cost']}>{rocketCostMapError}</p>
            )}
            {rocketCostMapStatus === Status.RESOLVED && (
              <p className={classes['total-cost']}>
                Total Cost of Launches: ${totalCost}
              </p>
            )}

            <LaunchList
              onChangeLaunchCost={changeLaunchCost}
              launchList={launchListWithRocketCost}
              onChangePayloadType={changePayloadType}
            />
          </>
        )}
      </div>
    </main>
  );
};
