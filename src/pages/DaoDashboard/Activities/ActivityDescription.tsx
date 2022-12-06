import { Flex, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Activity, ActivityEventType, GovernanceActivity, TreasuryActivity } from '../../../types';
import { ActivityAddress } from './ActivityAddress';

function TreasuryDescription({ activity }: { activity: Activity }) {
  const { t } = useTranslation();

  const treasuryActivity = activity as TreasuryActivity;

  if (!!treasuryActivity.transaction && !treasuryActivity.transaction.transfers.length) {
    return null;
  }

  const transferTypeStr =
    treasuryActivity.isDeposit && activity.eventType !== ActivityEventType.Governance
      ? t('receive')
      : t('send');
  const transferDirStr =
    treasuryActivity.isDeposit && activity.eventType !== ActivityEventType.Governance
      ? t('from')
      : t('to');

  return (
    <>
      <Text>
        {transferTypeStr} {treasuryActivity.transferAmountTotals.join(', ')} {transferDirStr}
      </Text>
      {treasuryActivity.transferAddresses.length > 2 ? (
        <Text>{t('addresses', { numOfAddresses: treasuryActivity.transferAddresses.length })}</Text>
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
function GovernanceDescription({ activity }: { activity: GovernanceActivity }) {
  const { t } = useTranslation('dashboard');

  return (
    <>
      {!!activity.eventTransactionsCount && (
        <Text> {t('proposalDescription', { txCount: activity.eventTransactionsCount })}</Text>
      )}
    </>
  );
}

export function ActivityDescription({ activity }: { activity: Activity }) {
  const { t } = useTranslation();
  const governanceActivity = activity as GovernanceActivity;
  return (
    <Flex
      color="grayscale.100"
      textStyle="text-lg-mono-semibold"
      gap="0.5rem"
      flexWrap="wrap"
    >
      {activity.eventType === ActivityEventType.Governance && (
        <>
          <GovernanceDescription activity={governanceActivity} />
          {!!governanceActivity.transaction?.transfers.length &&
            !!governanceActivity.eventTransactionsCount && <Text> {t('to')} </Text>}
        </>
      )}
      {!!activity.transaction && <TreasuryDescription activity={activity} />}
    </Flex>
  );
}
