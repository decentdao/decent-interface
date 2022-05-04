import { useCallback, useEffect } from 'react'
import { useTransaction } from '../web3/transactions';
import { useWeb3 } from '../web3';
import { BigNumber } from 'ethers';
import { useNavigate } from 'react-router';
import { GovernorModule, GovernorModule__factory } from '../typechain-types';
import { useDAOData } from './index';

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
}: {
  daoAddress: string | undefined,
  proposalData: ProposalData | undefined,
  setPending: React.Dispatch<React.SetStateAction<boolean>>
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
      pendingMessage: "Creating Proposal",
      failedMessage: "Proposal Creation Failed",
      successMessage: "Proposal Created",
      successCallback: () => {
        navigate(`/daos/${daoAddress}`,);
      },
      rpcErrorCallback: (error: any) => {
        console.error(error)
      },
    });
  }, [daoAddress, navigate, contractCallCreateProposal, daoData, proposalData, setPending, signerOrProvider])
  return createProposal;
}

export default useCreateProposal;