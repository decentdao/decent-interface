import { useCallback, useEffect } from 'react'
import { useTransaction } from '../contexts/web3Data/transactions';
import { useWeb3 } from '../contexts/web3Data';
import { BigNumber } from 'ethers';
import { useNavigate } from 'react-router';
import { GovernorModule, GovernorModule__factory } from '../typechain-types';
import { useDAOData } from '../contexts/daoData/index';

type ProposalData = {
  targets: string[];
  values: BigNumber[];
  calldatas: string[];
  description: string;
}

const useCreateProposal = ({
  daoAddress,
  proposalData,
  setPending,
  clearState
}: {
  daoAddress: string | undefined,
  proposalData: ProposalData | undefined,
  setPending: React.Dispatch<React.SetStateAction<boolean>>,
  clearState: () => void
}
) => {
  const [{ signerOrProvider }] = useWeb3();
  const navigate = useNavigate();
  const [ daoData, ] = useDAOData();

  const [contractCallCreateProposal, contractCallPending] = useTransaction();

  useEffect(() => {
    setPending(contractCallPending);
  }, [setPending, contractCallPending]);

  let createProposal = useCallback(() => {
    if (
      !signerOrProvider ||
      !proposalData ||
      !setPending ||
      !daoData ||
      !daoData.moduleAddresses
    ) {
      return;
    }

    const governor: GovernorModule = GovernorModule__factory.connect(daoData.moduleAddresses[1], signerOrProvider);

    contractCallCreateProposal({
      contractFn: () => governor.propose(proposalData.targets, proposalData.values, proposalData.calldatas, proposalData.description),
      pendingMessage: "Creating Proposal...",
      failedMessage: "Proposal Creation Failed",
      successMessage: "Proposal Created",
      successCallback: () => {
        clearState();
        navigate(`/daos/${daoAddress}`,);
      },
    });
  }, [daoAddress, navigate, contractCallCreateProposal, daoData, proposalData, setPending, signerOrProvider, clearState])
  return createProposal;
}

export default useCreateProposal;