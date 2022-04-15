import { useCallback, useEffect } from 'react'
import { useTransaction } from '../web3/transactions';
import { useWeb3 } from '../web3';
import { BigNumber } from 'ethers';
import { useNavigate } from 'react-router';
import { GovernorModule, GovernorModule__factory } from '../typechain-types';

type ProposalData = {
  targets: string[];
  values: BigNumber[];
  calldatas: string[];
  description: string;
}

const useCreateProposal = ({
  daoAddress,
  governorAddress,
  proposalData,
  setPending,
}: {
  daoAddress: string | undefined,
  governorAddress: string | undefined,
  proposalData: ProposalData | undefined,
  setPending: React.Dispatch<React.SetStateAction<boolean>>
}
) => {
  const { signerOrProvider } = useWeb3();
  const navigate = useNavigate();

  const [contractCallDeploy, contractCallPending] = useTransaction();

  useEffect(() => {
    setPending(contractCallPending);
  }, [setPending, contractCallPending]);

  let createProposal = useCallback(() => {
    if (
      !signerOrProvider ||
      !proposalData ||
      !setPending ||
      !governorAddress
    ) {
      return;
    }

    const governor: GovernorModule = GovernorModule__factory.connect(governorAddress, signerOrProvider);

    contractCallDeploy({
      contractFn: () => governor.propose(proposalData.targets, proposalData.values, proposalData.calldatas, proposalData.description),
      pendingMessage: "Creating Proposal",
      failedMessage: "Proposal Creation Failed",
      successMessage: "Proposal Created",
      successCallback: (receipt) => {
        navigate(`/daos/${daoAddress}`,);
      },
      rpcErrorCallback: (error: any) => {
        console.error(error)
      },
    });
  }, [daoAddress, navigate, contractCallDeploy, governorAddress, proposalData, setPending, signerOrProvider])
  return createProposal;
}

export default useCreateProposal;