import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage, useBroadcastChannel } from 'hooks';
import * as API from 'services';
import { Status, RocketCostMap, Launch } from 'types';

export const useRocketCosts = (launchList: Launch[]) => {
  const [rocketCostMap, setRocketCostMap] = useLocalStorage<RocketCostMap>(
    'rocketCostMap',
    {}
  );
  const [status, setStatus] = useState<Status>(
    Object.keys(rocketCostMap).length ? Status.RESOLVED : Status.PENDING
  );
  const [error, setError] = useState<string | null>(null);

  useBroadcastChannel(
    'rocket-cost-channel',
    rocketCostMap,
    setRocketCostMap,
    setError
  );

  const fetchRocketCosts = useCallback(async () => {
    try {
      if (launchList.length && !Object.keys(rocketCostMap).length) {
        setStatus(Status.PENDING);
        const rocketIds = Array.from(
          new Set(launchList.map((l) => l.rocket.rocket_id))
        );
        const rockets = await Promise.all(rocketIds.map(API.fetchRocket));
        const newCostMap = rockets.reduce<RocketCostMap>((map, rocket) => {
          map[rocket.rocket_id] = rocket.cost_per_launch;
          return map;
        }, {});

        setTimeout(() => {
          setRocketCostMap(newCostMap);
          setStatus(Status.RESOLVED);
        }, 3000);
      }
    } catch (err) {
      setError((err as Error).message);
      setStatus(Status.REJECTED);
    }
  }, [launchList, rocketCostMap, setRocketCostMap]);

  useEffect(() => {
    fetchRocketCosts();
  }, [fetchRocketCosts]);

  return { rocketCostMap, status, error, setRocketCostMap };
};
