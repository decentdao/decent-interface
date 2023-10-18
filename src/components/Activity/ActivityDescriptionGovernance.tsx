import { Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useGetMetadata } from '../../hooks/DAO/proposal/useGetMetadata';
import {
  Activity,
  GovernanceActivity,
  MultisigProposal,
  ActivityEventType,
  TreasuryActivity,
  SnapshotProposal,
  FractalProposal,
} from '../../types';
import { ActivityAddress } from './ActivityAddress';

const formatId = (proposalId: string) => {
  if (proposalId.startsWith('0x')) {
    // Multisig id, just give the first 4 characters
    return `#${proposalId.substring(2, 6)}`;
  } else {
    // Azorius id is just incrementing whole number
    return `#${proposalId}`;
  }
};

function TargetAddress({ activity }: { activity: Activity }) {
  const governanceActivity = activity as GovernanceActivity;
  if (governanceActivity.targets.length === 1) {
    return <ActivityAddress address={governanceActivity.targets[0]} />;
  } else {
    return null;
  }
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
  const metaData = useGetMetadata(activity as FractalProposal);

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

  const treasuryActivity = activity as TreasuryActivity;
  const hasTransfers =
    treasuryActivity.transferAddresses && !!treasuryActivity.transferAddresses.length;

  return (
    <>
      <Text>{formatId((activity as GovernanceActivity).proposalId)}</Text>
      <Text>{metaData.title || metaData.description}</Text>
      <TargetAddress activity={activity} />
      {hasTransfers && <Text> {t('proposalDescriptionCont', { ns: 'dashboard' })} </Text>}
      <OnChainRejectionMessage activity={activity} />
    </>
  );
}
