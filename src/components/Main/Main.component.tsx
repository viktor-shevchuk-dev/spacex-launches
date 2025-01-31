import { FC, useState, useEffect } from 'react';

import { ErrorBoundary, LaunchList } from 'components';

import { Launch, Status, Rocket, RocketCostMap } from 'types';
import { fetchLaunchList, fetchRocket } from 'services';

export const Main: FC = () => {
  const [launchList, setLaunchList] = useState<Launch[]>([]);
  const [launchListStatus, setLaunchListStatus] = useState<Status>(Status.IDLE);
  const [launchListError, setLaunchListError] = useState<string | null>(null);

  const [rocketCostMap, setRocketCostMap] = useState<RocketCostMap>({});
  const [rocketCostMapStatus, setRocketCostMapStatus] = useState<Status>(
    Status.IDLE
  );
  const [rocketCostMapError, setRocketCostMapError] = useState<string | null>(
    null
  );

  useEffect(() => {
    setLaunchListStatus(Status.PENDING);
    fetchLaunchList()
      .then(
        (launchList: Launch[]) => {
          console.log(launchList);
          setLaunchList(launchList);
          setLaunchListStatus(Status.RESOLVED);

          const rocketIdList = Array.from(
            new Set(launchList.map((launch) => launch.rocket.rocket_id))
          );
          const rocketPromiseList = rocketIdList.map(fetchRocket);
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
          setRocketCostMapStatus(Status.PENDING);
          setRocketCostMap(
            rocketList.reduce((map: RocketCostMap, rocket) => {
              map[rocket.rocket_id] = rocket.cost_per_launch;
              return map;
            }, {})
          );
          setTimeout(() => {
            setRocketCostMapStatus(Status.RESOLVED);
          }, 2000);
        },
        (error: Error) => {
          setRocketCostMapError(error.message);
          setRocketCostMapStatus(Status.REJECTED);
        }
      );
  }, []);

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

  return (
    <main>
      <div className="container">
        {launchListStatus === Status.PENDING && <p>Loading...</p>}
        {launchListStatus === Status.REJECTED && <p>{launchListError}</p>}
        {launchListStatus === Status.RESOLVED && (
          <ErrorBoundary>
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

            <LaunchList launchList={launchListWithRocketCost} />
          </ErrorBoundary>
        )}
      </div>
    </main>
  );
};
