import { FC } from 'react';

import { LaunchList, TotalCost } from 'components';
import { Status } from 'types';
import * as API from 'services';
import { useLaunches, useRocketCosts } from 'hooks';
import classes from './Main.module.css';

export const Main: FC = () => {
  const {
    launchList,
    status: launchStatus,
    error: launchError,
    setLaunchList,
  } = useLaunches();

  const {
    rocketCostMap,
    status: rocketStatus,
    error: rocketError,
    setRocketCostMap,
  } = useRocketCosts(launchList);

  const launchListWithRocketCost = launchList.map((launch) => ({
    ...launch,
    cost: {
      status: rocketStatus,
      error: rocketError,
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
      setLaunchList((prevLaunchList) =>
        prevLaunchList.map((launch) => {
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
  console.log({ launchStatus, rocketStatus });

  return (
    <main>
      <div className={`container ${classes['launch-shelf']}`}>
        {launchStatus === Status.PENDING && (
          <p className={classes.loading}>Loading...</p>
        )}
        {launchStatus === Status.REJECTED && <p>{launchError}</p>}
        {launchStatus === Status.RESOLVED && (
          <>
            <TotalCost
              status={rocketStatus}
              error={rocketError}
              total={totalCost}
            />
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
