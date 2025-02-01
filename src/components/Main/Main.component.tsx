import { FC, useState, useEffect } from 'react';

import { LaunchList } from 'components';
import { Launch, Status, RocketCostMap } from 'types';
import * as API from 'services';
import { useBroadcastChannel, useLocalStorage } from 'hooks';
import isEmpty from 'lodash/isEmpty';

export const Main: FC = () => {
  const [launchList, setLaunchList] = useLocalStorage<Launch[]>(
    'launchList',
    []
  );
  const [launchListStatus, setLaunchListStatus] = useState<Status>(() =>
    launchList.length > 0 ? Status.RESOLVED : Status.IDLE
  );
  const [launchListError, setLaunchListError] = useState<string | null>(null);

  const [rocketCostMap, setRocketCostMap] = useLocalStorage<RocketCostMap>(
    'rocketCostMap',
    {}
  );
  const [rocketCostMapStatus, setRocketCostMapStatus] = useState<Status>(() =>
    !isEmpty(rocketCostMap) ? Status.RESOLVED : Status.IDLE
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

  useEffect(() => {
    if (launchList.length === 0) {
      setLaunchListStatus(Status.PENDING);
      API.fetchLaunchList()
        .then(
          (freshlaunchList: Launch[]) => {
            setLaunchList(freshlaunchList);
            setLaunchListStatus(Status.RESOLVED);

            const rocketIdList = Array.from(
              new Set(freshlaunchList.map((launch) => launch.rocket.rocket_id))
            );
            const rocketPromiseList = rocketIdList.map(API.fetchRocket);
            if (isEmpty(rocketCostMap)) {
              setRocketCostMapStatus(Status.PENDING);
            }
            return Promise.all(rocketPromiseList);
          },
          (error: Error) => {
            setLaunchListError(error.message);
            setLaunchListStatus(Status.REJECTED);
            throw error;
          }
        )
        .then(
          (rocketList) => {
            setTimeout(() => {
              const rocketCostMap = rocketList.reduce(
                (map: RocketCostMap, rocket) => {
                  map[rocket.rocket_id] = rocket.cost_per_launch;
                  return map;
                },
                {}
              );
              setRocketCostMap(rocketCostMap);
              setRocketCostMapStatus(Status.RESOLVED);
            }, 1000);
          },
          (error: Error) => {
            setRocketCostMapError(error.message);
            setRocketCostMapStatus(Status.REJECTED);
          }
        );
    } else {
      API.fetchLaunchList()
        .then(
          (freshlaunchList: Launch[]) => {
            setLaunchList(freshlaunchList);
            setLaunchListStatus(Status.RESOLVED);

            const rocketIdList = Array.from(
              new Set(freshlaunchList.map((launch) => launch.rocket.rocket_id))
            );
            const rocketPromiseList = rocketIdList.map(API.fetchRocket);
            if (isEmpty(rocketCostMap)) {
              setRocketCostMapStatus(Status.PENDING);
            }
            return Promise.all(rocketPromiseList);
          },
          (error: Error) => {
            setLaunchListError(error.message);
            setLaunchListStatus(Status.REJECTED);
            throw error;
          }
        )
        .then(
          (rocketList) => {
            setTimeout(() => {
              const rocketCostMap = rocketList.reduce(
                (map: RocketCostMap, rocket) => {
                  map[rocket.rocket_id] = rocket.cost_per_launch;
                  return map;
                },
                {}
              );
              setRocketCostMap(rocketCostMap);
              setRocketCostMapStatus(Status.RESOLVED);
            }, 1000);
          },
          (error: Error) => {
            setRocketCostMapError(error.message);
            setRocketCostMapStatus(Status.REJECTED);
          }
        );
    }
  }, [launchList.length, setLaunchList, setRocketCostMap]);

  const launchListWithRocketCost = launchList.map((launch) => {
    return {
      ...launch,
      cost: {
        status: rocketCostMapStatus,
        error: rocketCostMapError,
        value: rocketCostMap[launch.rocket.rocket_id],
      },
    };
  });

  const changeLaunchCost = async (
    id: string,
    field: { cost_per_launch: number }
  ) => {
    const originalCost = rocketCostMap[id];

    try {
      setRocketCostMap((prevRocketCostMap) => ({
        ...prevRocketCostMap,
        [id]: field.cost_per_launch,
      }));
      await API.editRocket(id, field);
    } catch (error: Error) {
      if (!window.confirm(`Error: ${error.message}. Rollback changes?`)) {
        return;
      }

      setRocketCostMap((prevRocketCostMap) => ({
        ...prevRocketCostMap,
        [id]: originalCost,
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
    } catch (error: Error) {
      if (!window.confirm(`Error: ${error.message}. Rollback changes?`)) {
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

  return (
    <main>
      <div className="container">
        {launchListStatus === Status.PENDING && <p>Loading...</p>}
        {launchListStatus === Status.REJECTED && <p>{launchListError}</p>}
        {launchListStatus === Status.RESOLVED && (
          <>
            {rocketCostMapStatus === Status.PENDING && (
              <p>Loading Total Cost of Launches...</p>
            )}
            {rocketCostMapStatus === Status.REJECTED && (
              <p>{rocketCostMapError}</p>
            )}
            {rocketCostMapStatus === Status.RESOLVED && (
              <div className="total-cost">
                Total Cost of Launches: $
                {launchListWithRocketCost.reduce(
                  (sum, launch) => sum + launch.cost.value,
                  0
                )}
              </div>
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
