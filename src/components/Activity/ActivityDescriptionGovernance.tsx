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

interface IActivityDescription {
  activity: Activity;
}
interface IActivityProposal {
  proposalNumber: string;
}

function ActivityProposalNumber({ proposalNumber }: IActivityProposal) {
  return <Text>#{createAccountSubstring(proposalNumber)}</Text>;
}

function ActivityAddresses({ activity }: IActivityDescription) {
  const { t } = useTranslation('treasury');
  const governanceActivity = activity as GovernanceActivity;
  const txCount = governanceActivity.txHashes.length;

  if (txCount > 1) {
    return <Text>{t('addresses', { ns: 'treasury', numOfAddresses: txCount })}</Text>;
  }
  return (
    <>
      {governanceActivity.targets.map((address, i, arr) => (
        <ActivityAddress
          key={address + i}
          address={address}
          addComma={i !== arr.length - 1}
        />
      ))}
    </>
  );
}

function OnChainRejectionMessage({ activity }: IActivityDescription) {
  const { t } = useTranslation('dashboard');
  const governanceActivity = activity as GovernanceActivity;
  if (!governanceActivity.multisigRejectedProposalNumber) {
    return null;
  }
  return (
    <Text>
      {t('proposalOnChainRejection', {
        proposalNumber: createAccountSubstring(governanceActivity.multisigRejectedProposalNumber),
      })}
    </Text>
  );
}

export function ActivityDescriptionGovernance({ activity }: IActivityDescription) {
  const { t } = useTranslation(['common', 'dashboard']);

  if (activity.eventType !== ActivityEventType.Governance) {
    return null;
  }
  const governanceActivity = activity as GovernanceActivity;
  const treasuryActivity = activity as TreasuryActivity;

  const hasTransfers =
    treasuryActivity.transferAddresses && !!treasuryActivity.transferAddresses.length;

  const transactionDescription = t('proposalDescription', {
    ns: 'dashboard',
    txCount: governanceActivity.txHashes.length,
  });

  return (
    <>
      <ActivityProposalNumber proposalNumber={governanceActivity.proposalNumber} />
      <Text>{transactionDescription}</Text>
      <ActivityAddresses activity={activity} />
      {hasTransfers && <Text> {t('proposalDescriptionCont', { ns: 'dashboard' })} </Text>}
      <OnChainRejectionMessage activity={activity} />
    </>
  );
}
