import { Launch, Rocket } from 'types';

const BASE_URL = 'https://api.spacexdata.com/v3';

const fetchWithErrorHandling = async <T>(
  url: string,
  config: RequestInit = {}
): Promise<T> => {
  const response = await fetch(url, config);

  if (!response.ok) {
    return Promise.reject(new Error('Not found'));
  }

  return response.json() as Promise<T>;
};

const editLaunchField = async <T>(specifier: string, id: string, field: T) =>
  await fetchWithErrorHandling(`${BASE_URL}/${specifier}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ field }),
  });

export const fetchLaunchList = async (): Promise<Launch[]> =>
  await fetchWithErrorHandling(`${BASE_URL}/launches`);

export const fetchRocket = async (id: string): Promise<Rocket> =>
  await fetchWithErrorHandling(`${BASE_URL}/rockets/${id}`);

export const editRocket = async (
  id: string,
  field: { cost_per_launch: number }
) => await editLaunchField('rockets', id, field);

export const editPayload = async (
  id: string,
  field: { payload_type: string }
) => await editLaunchField('payloads', id, field);
