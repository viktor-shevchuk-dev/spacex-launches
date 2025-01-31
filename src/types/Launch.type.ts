import { Status } from './Status.type';

export interface Cost {
  value: number;
  status: Status;
  error: string | null;
}

export interface Launch {
  flight_number: number;
  mission_name: string;
  launch_date_utc: string;
  rocket: {
    rocket_id: string;
    second_stage: { payloads: Array<{ payload_type: string }> };
  };
  cost: Cost;
}
