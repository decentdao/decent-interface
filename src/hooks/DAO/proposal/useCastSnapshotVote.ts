import snapshot from '@snapshot-labs/snapshot.js';
import { ethers } from 'ethers';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { logError } from '../../../helpers/errorLogging';
import { useFractal } from '../../../providers/App/AppProvider';
import { useEthersSigner } from '../../../providers/Ethers/hooks/useEthersSigner';
import { ExtendedSnapshotProposal } from '../../../types';
import encryptWithShutter from '../../../utils/shutter';

const useCastSnapshotVote = (extendedSnapshotProposal: ExtendedSnapshotProposal | null) => {
  const [selectedChoice, setSelectedChoice] = useState<number>();
  const [snapshotWeightedChoice, setSnapshotWeightedChoice] = useState<number[]>([]);

  const {
    node: { daoSnapshotENS },
    readOnly: {
      user: { address },
    },
  } = useFractal();

  const signer = useEthersSigner();

  const client = useMemo(() => {
    if (daoSnapshotENS) {
      return new snapshot.Client712('https://hub.snapshot.org');
    }
    return undefined;
  }, [daoSnapshotENS]);

  useEffect(() => {
    if (extendedSnapshotProposal) {
      setSnapshotWeightedChoice(extendedSnapshotProposal.choices.map(() => 0));
    }
  }, [extendedSnapshotProposal]);

  const { t } = useTranslation('transaction');

  const handleSelectSnapshotChoice = useCallback((choiceIndex: number) => {
    setSelectedChoice(choiceIndex);
  }, []);

  const handleChangeSnapshotWeightedChoice = useCallback((choiceIndex: number, value: number) => {
    setSnapshotWeightedChoice(prevState =>
      prevState.map((choiceValue, index) => (index === choiceIndex ? value : choiceValue)),
    );
  }, []);

  const castSnapshotVote = useCallback(
    async (onSuccess?: () => Promise<void>) => {
      if (
        signer &&
        signer?.provider &&
        address &&
        daoSnapshotENS &&
        extendedSnapshotProposal &&
        client
      ) {
        let toastId;
        const mappedSnapshotWeightedChoice: { [choiceKey: number]: number } = {};
        if (extendedSnapshotProposal.type === 'weighted') {
          snapshotWeightedChoice.forEach((value, choiceIndex) => {
            if (value > 0) {
              mappedSnapshotWeightedChoice[choiceIndex + 1] = value;
            }
          });
        }
        const choice =
          extendedSnapshotProposal.type === 'weighted'
            ? mappedSnapshotWeightedChoice
            : (selectedChoice as number) + 1;
        try {
          toastId = toast.loading(t('pendingCastVote'), {
            duration: Infinity,
          });
          if (extendedSnapshotProposal.privacy === 'shutter') {
            const encryptedChoice = await encryptWithShutter(
              JSON.stringify(choice),
              extendedSnapshotProposal.proposalId,
            );
            await client.vote(signer.provider as ethers.providers.Web3Provider, address, {
              space: daoSnapshotENS,
              proposal: extendedSnapshotProposal.proposalId,
              type: extendedSnapshotProposal.type,
              privacy: extendedSnapshotProposal.privacy,
              choice: encryptedChoice!,
              app: 'decent',
            });
          } else {
            await client.vote(signer.provider as ethers.providers.Web3Provider, address, {
              space: daoSnapshotENS,
              proposal: extendedSnapshotProposal.proposalId,
              type: extendedSnapshotProposal.type,
              choice,
              app: 'decent',
            });
          }
          toast.success(`${t('successCastVote')}. ${t('snapshotRecastVoteHelper')}`, {
            id: toastId,
          });
          setSelectedChoice(undefined);
          if (onSuccess) {
            // Need to refetch votes after timeout so that Snapshot API has enough time to record the vote
            setTimeout(() => onSuccess(), 3000);
          }
        } catch (e) {
          toast.error(t('failedCastVote'), { id: toastId });
          logError('Error while casting Snapshot vote', e);
        }
      }
    },
    [
      signer,
      address,
      daoSnapshotENS,
      extendedSnapshotProposal,
      client,
      selectedChoice,
      snapshotWeightedChoice,
      t,
    ],
  );

  return {
    castSnapshotVote,
    selectedChoice,
    snapshotWeightedChoice,
    handleSelectSnapshotChoice,
    handleChangeSnapshotWeightedChoice,
  };
};

export default useCastSnapshotVote;
