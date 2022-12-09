import { Flex, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Activity, ActivityEventType, GovernanceActivity, TreasuryActivity } from '../../../types';
import { ActivityAddress } from './ActivityAddress';

function TreasuryDescription({ activity }: { activity: Activity }) {
  const { t } = useTranslation(['common', 'treasury']);

  const treasuryActivity = activity as TreasuryActivity;

  if (!!treasuryActivity.transaction && !treasuryActivity.transaction.transfers.length) {
    return null;
  }

  const isGovernanceActivity = activity.eventType === ActivityEventType.Governance;
  const isDeposit = treasuryActivity.isDeposit;

  const transferTypeStr =
    !isGovernanceActivity && isDeposit
      ? t('receive')
      : isGovernanceActivity && !isDeposit
      ? t('transfer')
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
function GovernanceDescription({ activity }: { activity: GovernanceActivity }) {
  const { t } = useTranslation(['common', 'dashboard', 'treasury']);

  if (activity.eventType !== ActivityEventType.Governance) {
    return null;
  }

  const hasTransfers = !!activity.transaction?.transfers.length;
  const txCount = activity.txHashes.length;

  return (
    <>
      <Text>
        {' '}
        {t('proposalDescription', { ns: 'dashboard', txCount: activity.txHashes.length })}{' '}
      </Text>
      {txCount > 1 ? (
        <Text>{t('addresses', { ns: 'treasury', numOfAddresses: txCount })}</Text>
      ) : (
        activity.txHashes.map((address, i, arr) => (
          <ActivityAddress
            key={address + i}
            address={address}
            addComma={i !== arr.length - 1}
          />
        ))
      )}
      {hasTransfers && <Text> {t('to')} </Text>}
    </>
  );
}

export function ActivityDescription({ activity }: { activity: Activity }) {
  const governanceActivity = activity as GovernanceActivity;
  return (
    <Flex
      color="grayscale.100"
      textStyle="text-lg-mono-semibold"
      gap="0.5rem"
      flexWrap="wrap"
    >
      <GovernanceDescription activity={governanceActivity} />
      {!!activity.transaction && <TreasuryDescription activity={activity} />}
    </Flex>
  );
}
