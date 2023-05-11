import { Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  GovernanceActivity,
  MultisigProposal,
  ActivityEventType,
  TreasuryActivity,
  AzoriusProposal,
  SnapshotProposal,
} from '../../types';

import { createProposalNumberSubstring } from '../../utils/string';
import { ActivityAddress } from './ActivityAddress';

interface IActivityDescription {
  activity: Activity;
}
interface IActivityProposal {
  proposalId: string;
}

function ActivityProposalNumber({ proposalId }: IActivityProposal) {
  return <Text>{createProposalNumberSubstring(proposalId)}</Text>;
}

function ActivityAddresses({ activity }: IActivityDescription) {
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

function OnChainRejectionMessage({ activity }: IActivityDescription) {
  const { t } = useTranslation('dashboard');
  const governanceActivity = activity as MultisigProposal;
  if (!governanceActivity.multisigRejectedProposalNumber) {
    return null;
  }
  return (
    <Text>
      {t('proposalOnChainRejection', {
        proposalId: createProposalNumberSubstring(
          governanceActivity.multisigRejectedProposalNumber
        ),
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
    count: governanceActivity.targets.length,
  });

  const azoriusProposalMetaDataTitle = (activity as AzoriusProposal).metaData?.title;
  const isSnapshotProposal = !!(activity as SnapshotProposal).snapshotProposalId;

  if (isSnapshotProposal) {
    return (
      <>
        <ActivityProposalNumber
          proposalId={(governanceActivity as SnapshotProposal).snapshotProposalId}
        />
        <Text>{(governanceActivity as SnapshotProposal).title}</Text>
      </>
    );
  }

  if (!!azoriusProposalMetaDataTitle) {
    return (
      <>
        <ActivityProposalNumber proposalId={governanceActivity.proposalId} />
        <Text>{azoriusProposalMetaDataTitle}</Text>
      </>
    );
  }

  return (
    <>
      <ActivityProposalNumber proposalId={governanceActivity.proposalId} />
      <Text>{transactionDescription}</Text>
      <ActivityAddresses activity={activity} />
      {hasTransfers && <Text> {t('proposalDescriptionCont', { ns: 'dashboard' })} </Text>}
      <OnChainRejectionMessage activity={activity} />
    </>
  );
}
