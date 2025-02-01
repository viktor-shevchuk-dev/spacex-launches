import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from 'hooks';
import * as API from 'services';
import { Launch, Status } from 'types';

export const useLaunches = () => {
  const [launchList, setLaunchList] = useLocalStorage<Launch[]>(
    'launchList',
    []
  );
  const [status, setStatus] = useState<Status>(
    launchList.length ? Status.RESOLVED : Status.IDLE
  );
  const [error, setError] = useState<string | null>(null);

  const fetchLaunches = useCallback(async () => {
    try {
      if (!launchList.length) {
        setStatus(Status.PENDING);
        const data = await API.fetchLaunchList();
        setTimeout(() => {
          setLaunchList(data);
          setStatus(Status.RESOLVED);
        }, 500);
      }
    } catch (err) {
      setError((err as Error).message);
      setStatus(Status.REJECTED);
    }
  }, [launchList.length, setLaunchList]);

  useEffect(() => {
    fetchLaunches();
  }, [fetchLaunches]);

  return { launchList, status, error, setLaunchList };
};
