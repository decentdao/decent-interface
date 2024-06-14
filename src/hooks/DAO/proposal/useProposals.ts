import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Id, toast } from 'react-toastify';
import { useFractal } from '../../../providers/App/AppProvider';
import { SortBy, FractalProposalState } from '../../../types';
import { CacheKeys, CacheExpiry } from '../../utils/cache/cacheDefaults';
import { useLocalStorage } from '../../utils/cache/useLocalStorage';
import { useLoadTempProposals } from '../loaders/useLoadDAOProposals';
import { TempProposalData } from './useSubmitProposal';

export default function useProposals({
  sortBy,
  filters,
}: {
  sortBy: SortBy;
  filters: FractalProposalState[];
}) {
  const {
    governance: { proposals },
  } = useFractal();

  const { t } = useTranslation(['proposal']);

  const loadTempDAOProposals = useLoadTempProposals();
  const [tempProposals, setTempProposals] = useState<TempProposalData[]>([]);
  const pendingProposalsToastIdRef = useRef<Id>();

  const dismissPendingProposalsToast = useCallback(() => {
    if (pendingProposalsToastIdRef.current) {
      toast.dismiss(pendingProposalsToastIdRef.current);
      pendingProposalsToastIdRef.current = undefined;
    }
  }, [pendingProposalsToastIdRef]);

  useEffect(() => {
    if (pendingProposalsToastIdRef.current) return;

    if (tempProposals.length) {
      setTimeout(() => {
        if (pendingProposalsToastIdRef.current) return;
        const toastId = toast.info(
          t('pendingProposalNotice', {
            tempProposalsLength: tempProposals.length,
          }),
          {
            autoClose: false,
            closeOnClick: false,
            draggable: false,
            closeButton: false,
          },
        );
        pendingProposalsToastIdRef.current = toastId;
      }, 1000);
      return () => dismissPendingProposalsToast();
    }
  }, [dismissPendingProposalsToast, t, tempProposals.length]);

  const getProposalsTotal = useCallback(
    (state: FractalProposalState) => {
      if (proposals && proposals.length) {
        return proposals.filter(proposal => proposal.state === state).length;
      }
    },
    [proposals],
  );

  const { setValue, getValue } = useLocalStorage();

  const removeTemporaryProposal = useCallback(
    (txHash: string) => {
      const temporaryProposals = (getValue(CacheKeys.TEMP_PROPOSALS) as TempProposalData[]) || [];
      const updatedProposals = temporaryProposals.filter(proposal => proposal.txHash !== txHash);

      setValue(CacheKeys.TEMP_PROPOSALS, updatedProposals, CacheExpiry.ONE_DAY);

      if (tempProposals.length !== updatedProposals.length) {
        setTempProposals(updatedProposals);
        if (updatedProposals.length === 0) {
          dismissPendingProposalsToast();
        }
      }
    },
    [dismissPendingProposalsToast, getValue, setValue, tempProposals.length],
  );

  const sortedAndFilteredProposals = useMemo(() => {
    return (proposals || [])
      .filter(proposal => {
        removeTemporaryProposal(proposal.transactionHash!);
        return filters.includes(proposal.state!);
      })
      .sort((a, b) => {
        const dataA = new Date(a.eventDate).getTime();
        const dataB = new Date(b.eventDate).getTime();
        if (sortBy === SortBy.Oldest) {
          return dataA - dataB;
        }
        return dataB - dataA;
      });
  }, [proposals, removeTemporaryProposal, filters, sortBy]);

  useEffect(() => {
    loadTempDAOProposals().then(data => setTempProposals(data));
  }, [loadTempDAOProposals]);

  return {
    proposals: sortedAndFilteredProposals,
    tempProposals,
    getProposalsTotal,
  };
}
