import { Flex, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Activity, TreasuryActivity, ActivityEventType } from '../../types';
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
      ? t('received')
      : isGovernanceActivity && !isDeposit
        ? t('transfer')
        : t('send');

  const transferDirStr = !hasTransfers
    ? undefined
    : treasuryActivity.isDeposit && activity.eventType !== ActivityEventType.Governance
      ? t('from')
      : t('to');

  const textString = transferTypeStr
    ? transferTypeStr +
      ' ' +
      treasuryActivity.transferAmountTotals.join(', ') +
      ' ' +
      transferDirStr
    : undefined;

  return (
    <Flex
      alignItems="center"
      flexWrap="wrap"
    >
      <Text mr={2}>{textString}</Text>
      {treasuryActivity.transferAddresses.length > 2
        ? t('addresses', {
            ns: 'treasury',
            numOfAddresses: treasuryActivity.transferAddresses.length,
          })
        : treasuryActivity.transferAddresses.map((address, i, arr) => (
            <ActivityAddress
              key={address + i}
              address={address}
              addComma={i !== arr.length - 1}
            />
          ))}
    </Flex>
  );
}
