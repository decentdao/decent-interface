import { ERC20__factory, FractalModule } from '@fractal-framework/fractal-contracts';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Address, encodeAbiParameters, getAddress, isHex, parseAbiParameters } from 'viem';
import { useSafeAPI } from '../../providers/App/hooks/useSafeAPI';
import { useEthersProvider } from '../../providers/Ethers/hooks/useEthersProvider';
import { FractalModuleType, FractalNode } from '../../types';
import { useCanUserCreateProposal } from '../utils/useCanUserSubmitProposal';
import useSubmitProposal from './proposal/useSubmitProposal';

interface IUseClawBack {
  childSafeInfo?: FractalNode;
  parentAddress?: Address | null;
}

export default function useClawBack({ childSafeInfo, parentAddress }: IUseClawBack) {
  const { t } = useTranslation(['proposal', 'proposalMetadata']);
  const provider = useEthersProvider();
  const safeAPI = useSafeAPI();
  const { submitProposal } = useSubmitProposal();
  const { canUserCreateProposal } = useCanUserCreateProposal();

  const handleClawBack = useCallback(async () => {
    if (childSafeInfo && childSafeInfo.daoAddress && parentAddress && safeAPI && provider) {
      const childSafeBalance = await safeAPI.getBalances(getAddress(childSafeInfo.daoAddress));

      const santitizedParentAddress = getAddress(parentAddress);
      const parentSafeInfo = await safeAPI.getSafeData(santitizedParentAddress);

      if (canUserCreateProposal && parentAddress && childSafeInfo && parentSafeInfo) {
        const fractalModule = childSafeInfo.fractalModules!.find(
          module => module.moduleType === FractalModuleType.FRACTAL,
        );
        const fractalModuleContract = fractalModule?.moduleContract as FractalModule;
        if (fractalModule) {
          const transactions = childSafeBalance.map(asset => {
            if (!asset.tokenAddress) {
              // Seems like we're operating with native coin i.e ETH
              const txData = encodeAbiParameters(
                parseAbiParameters('address, uint256, bytes, uint8'),
                [parentAddress, BigInt(asset.balance), '0x', 0],
              );

              const fractalModuleCalldata = fractalModuleContract.interface.encodeFunctionData(
                'execTx',
                [txData],
              );
              return {
                target: fractalModuleContract.address,
                value: 0,
                calldata: fractalModuleCalldata,
              };
            } else {
              const tokenContract = ERC20__factory.connect(asset.tokenAddress, provider);
              const clawBackCalldata = tokenContract.interface.encodeFunctionData('transfer', [
                parentAddress,
                asset.balance,
              ]);
              if (!isHex(clawBackCalldata)) {
                throw new Error("Error encoding clawback call data")
              }
              const txData = encodeAbiParameters(
                parseAbiParameters('address, uint256, bytes, uint8'),
                [getAddress(asset.tokenAddress), 0n, clawBackCalldata, 0],
              );

              const fractalModuleCalldata = fractalModuleContract.interface.encodeFunctionData(
                'execTx',
                [txData],
              );

              return {
                target: fractalModuleContract.address,
                value: 0,
                calldata: fractalModuleCalldata,
              };
            }
          });

          submitProposal({
            proposalData: {
              metaData: {
                title: t('Clawback Proposal', { ns: 'proposalMetadata' }),
                description: t(
                  'Transfer all funds from the targeted sub-Safe to the parent-Safe treasury.',
                  {
                    ns: 'proposalMetadata',
                  },
                ),
                documentationUrl: '',
              },
              targets: transactions.map(tx => tx.target),
              values: transactions.map(tx => BigInt(tx.value)),
              calldatas: transactions.map(tx => tx.calldata),
            },
            nonce: parentSafeInfo.nonce,
            pendingToastMessage: t('clawBackPendingToastMessage'),
            failedToastMessage: t('clawBackFailedToastMessage'),
            successToastMessage: t('clawBackSuccessToastMessage'),
            safeAddress: parentAddress,
          });
        }
      }
    }
  }, [canUserCreateProposal, childSafeInfo, parentAddress, provider, submitProposal, t, safeAPI]);

  return { handleClawBack };
}
