import { BigNumber } from 'ethers';
import { useCallback } from 'react';
import useProposals from '../providers/fractal/hooks/useProposals';
import { ProposalExecuteData } from '../types/proposal';
import {
  GnosisDAO,
  GovernanceTypes,
  TokenGovernanceDAO,
} from './../components/DaoCreator/provider/types/index';
import useBuildDAOTx from './useBuildDAOTx';
import useSafeContracts from './useSafeContracts';

const useProposeDAO = () => {
  const { multiSendContract } = useSafeContracts();

  const { submitProposal, pendingCreateTx, canUserCreateProposal } = useProposals();
  const [build] = useBuildDAOTx();

  const proposeMultisigSafe = useCallback(
    (daoData: GnosisDAO | TokenGovernanceDAO, successCallback: () => void) => {
      const propose = async () => {
        if (!multiSendContract) {
          return;
        }

        const builtSafeTx = await build(daoData);
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

  const proposeUsulSafe = useCallback(
    (daoData: GnosisDAO | TokenGovernanceDAO, successCallback: () => void) => {
      const propose = async () => {
        if (!multiSendContract) {
          return;
        }

        const builtSafeTx = await build(daoData);

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

  const proposeDao = useCallback(
    (daoData: TokenGovernanceDAO | GnosisDAO, successCallback: () => void) => {
      switch (daoData.governance) {
        case GovernanceTypes.GNOSIS_SAFE_USUL:
          return proposeUsulSafe(daoData, successCallback);
        case GovernanceTypes.GNOSIS_SAFE:
          return proposeMultisigSafe(daoData, successCallback);
      }
    },
    [proposeUsulSafe, proposeMultisigSafe]
  );

  return [proposeDao, pendingCreateTx, canUserCreateProposal] as const;
};

export default useProposeDAO;
