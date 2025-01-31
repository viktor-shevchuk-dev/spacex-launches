const BASE_URL = 'https://api.spacexdata.com/v3';

const fetchWithErrorHandling = async (url = '', config = {}) => {
  const response = await fetch(url, config);

  return response.ok
    ? await response.json()
    : Promise.reject(new Error('Not found'));
};

const editLaunchField = async (specifier: string, id: string, field) => {
  const response = await fetchWithErrorHandling(
    `${BASE_URL}/${specifier}/${id}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field }),
    }
  );
  const editedLaunch = response.json();
  return editedLaunch;
};

export const fetchLaunchList = () =>
  fetchWithErrorHandling(`${BASE_URL}/launches`);

export const fetchRocket = (id: string) =>
  fetchWithErrorHandling(`${BASE_URL}/rockets/${id}`);

export const editRocket = async (
  id: string,
  field: { cost_per_launch: number }
) => await editLaunchField('rockets', id, field);

export const editPayload = async (id, field) =>
  await editLaunchField('payloads', id, field);
