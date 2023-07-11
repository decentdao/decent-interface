import { Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useGetMultisigMetadata } from '../../hooks/DAO/proposal/useGetMultisigMetadata';
import {
  Activity,
  GovernanceActivity,
  MultisigProposal,
  ActivityEventType,
  TreasuryActivity,
  AzoriusProposal,
  SnapshotProposal,
} from '../../types';
import { ActivityAddress } from './ActivityAddress';

const formatId = (proposalId: string) => {
  if (proposalId.startsWith('0x')) {
    // Multisig id, just give the first 4 characters
    return `#${proposalId.substring(2, 6)}`;
  } else {
    // Azorius and Snapshot ids are incrementing whole numbers
    return `#${proposalId}`;
  }
};

function TargetAddresses({ activity }: { activity: Activity }) {
  const { t } = useTranslation('treasury');
  const governanceActivity = activity as GovernanceActivity;
  const txCount = governanceActivity.targets.length;

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

function OnChainRejectionMessage({ activity }: { activity: Activity }) {
  const { t } = useTranslation('dashboard');
  const governanceActivity = activity as MultisigProposal;
  if (!governanceActivity.multisigRejectedProposalNumber) {
    return null;
  }
  return (
    <Text>
      {t('proposalOnChainRejection', {
        proposalId: formatId(governanceActivity.multisigRejectedProposalNumber),
      })}
    </Text>
  );
}

export function ProposalTitle({ activity }: { activity: Activity }) {
  const { t } = useTranslation(['common', 'dashboard']);
  const { multisigMetadata } = useGetMultisigMetadata(
    (activity as GovernanceActivity).proposalId,
    activity.transaction
  );

  if (activity.eventType !== ActivityEventType.Governance) {
    return null;
  }

  if ((activity as SnapshotProposal).snapshotProposalId) {
    return (
      <>
        <Text>{formatId((activity as SnapshotProposal).snapshotProposalId)}</Text>
        <Text>{(activity as SnapshotProposal).title}</Text>
      </>
    );
  }

  const governanceActivity = activity as GovernanceActivity;

  const azoriusTitle = (activity as AzoriusProposal).data?.title;
  if (azoriusTitle) {
    return (
      <>
        <Text>{formatId(governanceActivity.proposalId)}</Text>
        <Text>{azoriusTitle}</Text>
      </>
    );
  }

  const treasuryActivity = activity as TreasuryActivity;
  const hasTransfers =
    treasuryActivity.transferAddresses && !!treasuryActivity.transferAddresses.length;

  const title =
    multisigMetadata?.title ||
    t('proposalDescription', {
      ns: 'dashboard',
      count: governanceActivity.targets.length,
    });

  return (
    <>
      <Text>{formatId(governanceActivity.proposalId)}</Text>
      <Text>{title}</Text>
      {!multisigMetadata?.title && <TargetAddresses activity={activity} />}
      {hasTransfers && <Text> {t('proposalDescriptionCont', { ns: 'dashboard' })} </Text>}
      <OnChainRejectionMessage activity={activity} />
    </>
  );
}
