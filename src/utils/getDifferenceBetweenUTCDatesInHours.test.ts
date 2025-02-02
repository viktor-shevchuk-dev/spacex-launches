import { getDifferenceBetweenUTCDatesInHours } from 'utils';

describe('getDifferenceBetweenUTCDatesInHours utility function', () => {
  it('should return 0 when both dates are the same', () => {
    const date = '2023-01-01T10:00:00Z';
    const result = getDifferenceBetweenUTCDatesInHours(date, date);
    expect(result).toBe(0);
  });

  it('should return a positive number when prevDate is later than currDate', () => {
    const prevDate = '2023-01-02T10:00:00Z';
    const currDate = '2023-01-01T10:00:00Z';
    const result = getDifferenceBetweenUTCDatesInHours(prevDate, currDate);
    expect(result).toBe(24);
  });

  it('should return a negative number when prevDate is earlier than currDate', () => {
    const prevDate = '2023-01-01T10:00:00Z';
    const currDate = '2023-01-02T12:00:00Z';
    const result = getDifferenceBetweenUTCDatesInHours(prevDate, currDate);
    expect(result).toBe(-26);
  });
});
