import { BigNumber } from 'ethers';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { GnosisDAO, TokenGovernanceDAO } from '../../components/DaoCreator/types';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { ProposalExecuteData } from '../../types/proposal';
import useSafeContracts from '../safe/useSafeContracts';
import useSubmitProposal from './proposal/useSubmitProposal';
import useBuildDAOTx from './useBuildDAOTx';

export const useCreateSubDAOProposal = () => {
  const { multiSendContract, fractalRegistryContract } = useSafeContracts();
  const { t } = useTranslation(['daoCreate', 'proposal', 'proposalMetadata']);

  const { submitProposal, pendingCreateTx, canUserCreateProposal } = useSubmitProposal();
  const [build] = useBuildDAOTx();
  const {
    gnosis: { safe },
    governance: { governanceToken },
  } = useFractal();

  const proposeDao = useCallback(
    (
      daoData: TokenGovernanceDAO | GnosisDAO,
      nonce: number | undefined,
      successCallback: (daoAddress: string) => void
    ) => {
      const propose = async () => {
        if (!multiSendContract || !fractalRegistryContract) {
          return;
        }

        const builtSafeTx = await build(daoData, safe.address, governanceToken?.address);
        if (!builtSafeTx) {
          return;
        }

        const { safeTx, predictedGnosisSafeAddress } = builtSafeTx;

        const proposalData: ProposalExecuteData = {
          targets: [multiSendContract.asSigner.address, fractalRegistryContract.asSigner.address],
          values: [BigNumber.from('0'), BigNumber.from('0')],
          calldatas: [
            multiSendContract.asSigner.interface.encodeFunctionData('multiSend', [safeTx]),
            fractalRegistryContract.asSigner.interface.encodeFunctionData('declareSubDAO', [
              predictedGnosisSafeAddress,
            ]),
          ],
          title: 'Create SubDAO',
          description: '',
          documentationUrl: '',
        };
        submitProposal({
          proposalData,
          nonce,
          pendingToastMessage: t('createSubDAOPendingToastMessage'),
          successToastMessage: t('proposalCreateSuccessToastMessage', { ns: 'proposal' }),
          failedToastMessage: t('proposalCreateFailureToastMessage', { ns: 'proposal' }),
          successCallback,
        });
      };
      propose();
    },
    [
      multiSendContract,
      fractalRegistryContract,
      build,
      safe.address,
      submitProposal,
      governanceToken?.address,
      t,
    ]
  );

  return { proposeDao, pendingCreateTx, canUserCreateProposal } as const;
};
