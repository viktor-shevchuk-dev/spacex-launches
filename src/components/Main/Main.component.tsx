import { FC } from 'react';

import { LaunchList, TotalCost } from 'components';
import {
  ChangeLaunchCostHandler,
  ChangePayloadTypeHandler,
  Status,
} from 'types';
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

  const changeLaunchCost: ChangeLaunchCostHandler = async (rocketId, field) => {
    const originalCost = rocketCostMap[rocketId];

    try {
      setRocketCostMap((prevRocketCostMap) => ({
        ...prevRocketCostMap,
        [rocketId]: field.cost_per_launch,
      }));
      await API.editRocket(rocketId, field);
    } catch (error) {
      const errorMessage = (error as Error).message;
      if (!window.confirm(`Error: ${errorMessage}. Rollback changes?`)) {
        return;
      }

      setRocketCostMap((prevRocketCostMap) => ({
        ...prevRocketCostMap,
        [rocketId]: originalCost,
      }));
    }
  };

  const changePayloadType: ChangePayloadTypeHandler = async (
    launchId,
    payloadId,
    field
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
      const errorMessage = (error as Error).message;
      if (!window.confirm(`Error: ${errorMessage}. Rollback changes?`)) {
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

  const launchListWithRocketCost = launchList.map((launch) => ({
    ...launch,
    cost: rocketCostMap[launch.rocket.rocket_id],
  }));

  const totalCost = launchListWithRocketCost.reduce(
    (sum, launch) => sum + launch.cost,
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
              isSummary
              status={rocketStatus}
              error={rocketError}
              value={totalCost}
              label="Total Cost of Launches"
            />
            <LaunchList
              costStatus={rocketStatus}
              costError={rocketError}
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
