import { Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Activity, TreasuryActivity, ActivityEventType } from '../../providers/Fractal/types';
import { ActivityAddress } from './ActivityAddress';

export function ActivityDescriptionTreasury({ activity }: { activity: Activity }) {
  const { t } = useTranslation(['common', 'treasury']);

  const treasuryActivity = activity as TreasuryActivity;

  const isGovernanceActivity = activity.eventType === ActivityEventType.Governance;
  const isDeposit = treasuryActivity.isDeposit;
  const hasTransfers = !!treasuryActivity.transferAddresses.length;

  const transferTypeStr = !hasTransfers
    ? undefined
    : !isGovernanceActivity && isDeposit
    ? t('receive')
    : isGovernanceActivity && !isDeposit
    ? t('transfer')
    : t('send');

  const transferDirStr = !hasTransfers
    ? undefined
    : treasuryActivity.isDeposit && activity.eventType !== ActivityEventType.Governance
    ? t('from')
    : t('to');

  return (
    <>
      <Text>
        {transferTypeStr} {treasuryActivity.transferAmountTotals.join(', ')} {transferDirStr}
      </Text>
      {treasuryActivity.transferAddresses.length > 2 ? (
        <Text>
          {t('addresses', {
            ns: 'treasury',
            numOfAddresses: treasuryActivity.transferAddresses.length,
          })}
        </Text>
      ) : (
        treasuryActivity.transferAddresses.map((address, i, arr) => (
          <ActivityAddress
            key={address + i}
            address={address}
            addComma={i !== arr.length - 1}
          />
        ))
      )}
    </>
  );
}
