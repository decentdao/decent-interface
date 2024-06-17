import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { toast } from 'react-toastify';
import { TempProposalData } from '../hooks/DAO/proposal/useSubmitProposal';
import useDAOController from '../hooks/DAO/useDAOController';
import { CacheExpiry, CacheKeys } from '../hooks/utils/cache/cacheDefaults';
import { useLocalStorage } from '../hooks/utils/cache/useLocalStorage';
import { useUpdateSafeData } from '../hooks/utils/useUpdateSafeData';
import { useFractal } from '../providers/App/AppProvider';
import LoadingProblem from './LoadingProblem';

const useTemporaryProposals = () => {
  const {
    governance: { proposals },
  } = useFractal();
  const { t } = useTranslation(['proposal']);
  const [tempProposals, setTempProposals] = useState<TempProposalData[]>([]);
  const { getValue, setValue } = useLocalStorage();

  // Load temporary proposals from localstorage into state.
  useEffect(() => {
    setTempProposals((getValue(CacheKeys.TEMP_PROPOSALS) || []) as TempProposalData[]);
  }, [getValue]);

  // Show the temporary proposals toast if there are any.
  useEffect(() => {
    if (tempProposals.length === 0) {
      return;
    }

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

    return () => {
      toast.dismiss(toastId);
    };
  }, [t, tempProposals.length]);

  // Delete temporary proposals from localstorage when they're actually loaded into state
  useEffect(() => {
    const temporaryProposals = (getValue(CacheKeys.TEMP_PROPOSALS) as TempProposalData[]) || [];

    if (!proposals || temporaryProposals.length === 0) {
      return;
    }

    for (const proposal of proposals) {
      const updatedProposals = temporaryProposals.filter(
        _proposal => _proposal.txHash !== proposal.transactionHash,
      );

      setValue(CacheKeys.TEMP_PROPOSALS, updatedProposals, CacheExpiry.ONE_DAY);

      if (tempProposals.length !== updatedProposals.length) {
        setTempProposals(updatedProposals);
      }
    }
  }, [getValue, proposals, setValue, tempProposals.length]);
};

export default function DAOController() {
  const { errorLoading, wrongNetwork, invalidQuery } = useDAOController();
  useUpdateSafeData();
  const {
    node: { daoName },
  } = useFractal();

  useTemporaryProposals();

  useEffect(() => {
    if (daoName) {
      document.title = `${import.meta.env.VITE_APP_NAME} | ${daoName}`;
    }

    return () => {
      document.title = import.meta.env.VITE_APP_NAME;
    };
  }, [daoName]);

  let display;

  // the order of the if blocks of these next three error states matters
  if (invalidQuery) {
    display = <LoadingProblem type="badQueryParam" />;
  } else if (wrongNetwork) {
    display = <LoadingProblem type="wrongNetwork" />;
  } else if (errorLoading) {
    display = <LoadingProblem type="invalidSafe" />;
  } else {
    display = <Outlet />;
  }

  return display;
}
