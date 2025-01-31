export interface Rocket {
  rocket_id: string;
  second_stage: { payloads: Array<{ payload_type: string }> };
}
