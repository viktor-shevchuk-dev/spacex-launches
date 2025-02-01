import { FC } from 'react';

import classes from './PayloadList.module.css';
import { ChangePayloadTypeHandler, Payload } from 'types';
import { Button } from 'components/Button';

interface PayloadListProps {
  payloadList: Payload[];
  launchId: string;
  onChangePayloadType: ChangePayloadTypeHandler;
}

export const PayloadList: FC<PayloadListProps> = ({
  payloadList,
  launchId,
  onChangePayloadType,
}) => (
  <ul className={classes['payload-list']}>
    {payloadList.map(({ payload_id: payloadId, payload_type: payloadType }) => {
      return (
        <li key={payloadId} className={classes.payload}>
          <p className={classes.description}>Payload Type: {payloadType}</p>
          <Button
            secondary
            onClick={onChangePayloadType.bind(null, launchId, payloadId, {
              payload_type: 'Satellite',
            })}
          >
            Change payload type
          </Button>
        </li>
      );
    })}
  </ul>
);
