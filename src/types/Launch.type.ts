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
  mission_name: string;
  flight_number: number;
  launch_date_utc: string;
  rocket: Rocket;
  cost: number;
}
