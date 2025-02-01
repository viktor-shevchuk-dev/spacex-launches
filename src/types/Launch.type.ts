import { Status } from './Status.type';

export interface Cost {
  value: number;
  status: Status;
  error: string | null;
}

export interface Payload {
  payload_id: string;
  payload_type: string;
}

export interface SecondStage {
  payloads: Payload[];
}

export interface Rocket {
  rocket_id: string;
  cost_per_launch: number;
  second_stage: SecondStage;
}

export interface Launch {
  flight_number: number;
  mission_name: string;
  launch_date_utc: string;
  rocket: Rocket;
  cost: Cost;
}
