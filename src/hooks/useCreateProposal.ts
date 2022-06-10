import { useCallback, useEffect } from 'react';
import { useTransaction } from '../contexts/web3Data/transactions';
import { BigNumber } from 'ethers';
import { useNavigate } from 'react-router-dom';
import { GovernorModule, GovernorModule__factory } from '../assets/typechain-types/module-governor';
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
    state: {
      wallet: { signer },
    },
  } = useWeb3Provider();
  const navigate = useNavigate();
  const [daoData] = useDAOData();

  const [contractCallCreateProposal, contractCallPending] = useTransaction();

  useEffect(() => {
    setPending(contractCallPending);
  }, [setPending, contractCallPending]);

  let createProposal = useCallback(() => {
    if (!signer || !proposalData || !setPending || !daoData || !daoData.moduleAddresses) {
      return;
    }

    const governor: GovernorModule = GovernorModule__factory.connect(
      daoData.moduleAddresses[1],
      signer
    );

    contractCallCreateProposal({
      contractFn: () =>
        governor.propose(
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
    daoData,
    proposalData,
    setPending,
    signer,
    clearState,
  ]);
  return createProposal;
};

export default useCreateProposal;
