import {
  fetchLaunchList,
  fetchRocket,
  editRocket,
  editPayload,
} from 'services';
import { Launch, Rocket } from 'types';

describe('API Services', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  describe('fetchLaunchList', () => {
    it('should fetch a list of launches successfully', async () => {
      // Arrange
      const mockLaunches: Launch[] = [
        {
          mission_name: 'Test Mission',
          flight_number: 1,
          launch_date_utc: '2020-01-01T00:00:00Z',
          rocket: {
            rocket_id: 'test-rocket',
            cost_per_launch: 100000,
            second_stage: {
              payloads: [
                { payload_id: 'payload-1', payload_type: 'Satellite' },
              ],
            },
          },
          cost: 100000,
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLaunches,
      });

      // Act
      const result = await fetchLaunchList();

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.spacexdata.com/v3/launches',
        {}
      );
      expect(result).toEqual(mockLaunches);
    });

    it('should throw an error when the server returns a non-OK response', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      // Act / Assert
      await expect(fetchLaunchList()).rejects.toThrow('Not found');
    });
  });

  describe('fetchRocket', () => {
    it('should fetch a rocket by id successfully', async () => {
      // Arrange
      const mockRocket: Rocket = {
        rocket_id: 'test-rocket',
        cost_per_launch: 500000,
        second_stage: {
          payloads: [
            { payload_id: 'payload-1', payload_type: 'Satellite' },
            { payload_id: 'payload-2', payload_type: 'Satellite' },
          ],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRocket,
      });

      // Act
      const result = await fetchRocket('test-rocket');

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.spacexdata.com/v3/rockets/test-rocket',
        {}
      );
      expect(result).toEqual(mockRocket);
    });

    it('should throw an error when rocket data cannot be fetched', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      // Act / Assert
      await expect(fetchRocket('invalid-rocket-id')).rejects.toThrow(
        'Not found'
      );
    });
  });

  describe('editRocket', () => {
    it('should successfully patch rocket data', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      // Act
      await editRocket('test-rocket', { cost_per_launch: 12345 });

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.spacexdata.com/v3/rockets/test-rocket',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ field: { cost_per_launch: 12345 } }),
        }
      );
    });

    it('should throw an error if patching rocket data fails', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      // Act / Assert
      await expect(
        editRocket('invalid-rocket-id', { cost_per_launch: 9999 })
      ).rejects.toThrow('Not found');
    });
  });

  describe('editPayload', () => {
    it('should successfully patch payload data', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      // Act
      await editPayload('payload-1', { payload_type: 'NewSatelliteType' });

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.spacexdata.com/v3/payloads/payload-1',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ field: { payload_type: 'NewSatelliteType' } }),
        }
      );
    });

    it('should throw an error if patching payload data fails', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      // Act / Assert
      await expect(
        editPayload('invalid-payload-id', { payload_type: 'NewSatelliteType' })
      ).rejects.toThrow('Not found');
    });
  });
});
