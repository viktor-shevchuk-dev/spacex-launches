const BASE_URL = 'https://api.spacexdata.com/v3';

const fetchWithErrorHandling = async (url = '', config = {}) => {
  const response = await fetch(url, config);

  return response.ok
    ? await response.json()
    : Promise.reject(new Error('Not found'));
};

export const fetchLaunchList = () =>
  fetchWithErrorHandling(`${BASE_URL}/launches`);

export const fetchRocket = (id: string) =>
  fetchWithErrorHandling(`${BASE_URL}/rockets/${id}`);
