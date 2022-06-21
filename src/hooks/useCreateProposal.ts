import { useCallback, useEffect } from 'react';
import { useTransaction } from '../contexts/web3Data/transactions';
import { BigNumber } from 'ethers';
import { useNavigate } from 'react-router-dom';
import { useDAOData } from '../contexts/daoData/index';
import { useWeb3Provider } from '../contexts/web3Data/hooks/useWeb3Provider';

type ProposalData = {
  targets: string[];
  values: BigNumber[];
  calldatas: string[];
  description: string;
};

const useCreateProposal = ({
  daoAddress,
  proposalData,
  setPending,
  clearState,
}: {
  daoAddress: string | undefined;
  proposalData: ProposalData | undefined;
  setPending: React.Dispatch<React.SetStateAction<boolean>>;
  clearState: () => void;
}) => {
  const {
    state: { signerOrProvider },
  } = useWeb3Provider();
  const navigate = useNavigate();
  const [{ governorModuleContract }] = useDAOData();

  const [contractCallCreateProposal, contractCallPending] = useTransaction();

  useEffect(() => {
    setPending(contractCallPending);
  }, [setPending, contractCallPending]);

  let createProposal = useCallback(() => {
    if (!signerOrProvider || !proposalData || !setPending || !governorModuleContract) {
      return;
    }

    contractCallCreateProposal({
      contractFn: () =>
        governorModuleContract.propose(
          proposalData.targets,
          proposalData.values,
          proposalData.calldatas,
          proposalData.description
        ),
      pendingMessage: 'Creating Proposal...',
      failedMessage: 'Proposal Creation Failed',
      successMessage: 'Proposal Created',
      successCallback: () => {
        clearState();
        navigate(`/daos/${daoAddress}`);
      },
    });
  }, [
    daoAddress,
    navigate,
    contractCallCreateProposal,
    governorModuleContract,
    proposalData,
    setPending,
    signerOrProvider,
    clearState,
  ]);
  return createProposal;
};

export default useCreateProposal;
