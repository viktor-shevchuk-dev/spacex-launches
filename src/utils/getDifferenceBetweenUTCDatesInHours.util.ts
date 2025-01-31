import { differenceInHours, parseISO } from 'date-fns';

export const getDifferenceBetweenUTCDatesInHours = (
  prevDate: string,
  currData: string
): number => differenceInHours(parseISO(prevDate), parseISO(currData));
