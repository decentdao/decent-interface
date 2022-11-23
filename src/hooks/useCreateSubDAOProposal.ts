import { BigNumber } from 'ethers';
import { useCallback } from 'react';
import { GnosisDAO, TokenGovernanceDAO } from '../components/DaoCreator/provider/types/index';
import useProposals from '../providers/fractal/hooks/useProposals';
import { ProposalExecuteData } from '../types/proposal';
import useBuildDAOTx from './useBuildDAOTx';
import useSafeContracts from './useSafeContracts';

const useCreateSubDAOProposal = () => {
  const { multiSendContract } = useSafeContracts();

  const { submitProposal, pendingCreateTx, canUserCreateProposal } = useProposals();
  const [build] = useBuildDAOTx();

  const proposeDao = useCallback(
    (daoData: TokenGovernanceDAO | GnosisDAO, successCallback: (daoAddress: string) => void) => {
      const propose = async () => {
        if (!multiSendContract) {
          return;
        }

        const builtSafeTx = await build(daoData, true);
        if (!builtSafeTx) {
          return;
        }

        const { safeTx } = builtSafeTx;

        const proposalData: ProposalExecuteData = {
          targets: [multiSendContract.address],
          values: [BigNumber.from('0')],
          calldatas: [multiSendContract.interface.encodeFunctionData('multiSend', [safeTx])],
          description: 'to:' + multiSendContract.address + '_ txs:' + safeTx,
        };
        submitProposal({ proposalData, successCallback });
      };
      propose();
    },
    [multiSendContract, build, submitProposal]
  );

  return { proposeDao, pendingCreateTx, canUserCreateProposal } as const;
};

export default useCreateSubDAOProposal;
