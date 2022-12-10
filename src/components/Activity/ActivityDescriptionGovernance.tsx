import { Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { createAccountSubstring } from '../../hooks/utils/useDisplayName';
import {
  Activity,
  ActivityEventType,
  GovernanceActivity,
  TreasuryActivity,
} from '../../providers/Fractal/types';
import { ActivityAddress } from './ActivityAddress';

export function ActivityDescriptionGovernance({ activity }: { activity: Activity }) {
  const { t } = useTranslation(['common', 'dashboard', 'treasury']);

  if (activity.eventType !== ActivityEventType.Governance) {
    return null;
  }
  const governanceActivity = activity as GovernanceActivity;
  const treasuryActivity = activity as TreasuryActivity;

  const hasTransfers =
    treasuryActivity.transferAddresses && !!treasuryActivity.transferAddresses.length;
  const txCount = governanceActivity.txHashes.length;

  return (
    <>
      <Text>#{createAccountSubstring(governanceActivity.proposalNumber)}</Text>
      <Text>
        {t('proposalDescription', {
          ns: 'dashboard',
          txCount: governanceActivity.txHashes.length,
        })}{' '}
      </Text>
      {txCount > 1 ? (
        <Text>{t('addresses', { ns: 'treasury', numOfAddresses: txCount })}</Text>
      ) : (
        governanceActivity.targets.map((address, i, arr) => (
          <ActivityAddress
            key={address + i}
            address={address}
            addComma={i !== arr.length - 1}
          />
        ))
      )}
      {hasTransfers && <Text> {t('proposalDescriptionCont', { ns: 'dashboard' })} </Text>}
      {governanceActivity.multisigRejectedProposalNumber && (
        <Text>
          {' '}
          {t('proposalOnChainRejection', {
            ns: 'dashboard',
            proposalNumber: createAccountSubstring(
              governanceActivity.multisigRejectedProposalNumber
            ),
          })}{' '}
        </Text>
      )}
    </>
  );
}
