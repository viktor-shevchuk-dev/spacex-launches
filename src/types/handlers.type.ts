export type ChangeLaunchCostHandler = (
  rocketId: string,
  field: { cost_per_launch: number }
) => Promise<void>;

export type ChangePayloadTypeHandler = (
  launchId: string,
  payloadId: string,
  field: { payload_type: string }
) => Promise<void>;
