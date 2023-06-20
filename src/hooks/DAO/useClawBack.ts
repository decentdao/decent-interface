import { ERC20__factory, FractalModule } from '@fractal-framework/fractal-contracts';
import { SafeBalanceResponse } from '@safe-global/safe-service-client';
import { ethers } from 'ethers';
import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useProvider } from 'wagmi';
import { useFractal } from '../../providers/App/AppProvider';
import { SafeInfoResponseWithGuard, FractalModuleType, FractalNode } from '../../types';
import useSubmitProposal from './proposal/useSubmitProposal';

interface IUseClawBack {
  childSafeInfo?: FractalNode;
  parentAddress?: string | null;
}

export default function useClawBack({ childSafeInfo, parentAddress }: IUseClawBack) {
  const [parentSafeInfo, setParentSafeInfo] = useState<SafeInfoResponseWithGuard>();
  const [childSafeBalance, setChildSafeBalance] = useState<SafeBalanceResponse[]>([]);

  const { t } = useTranslation(['proposal', 'proposalMetadata']);
  const provider = useProvider();
  const {
    clients: { safeService },
  } = useFractal();
  const { submitProposal, canUserCreateProposal } = useSubmitProposal();
  useEffect(() => {
    const loadData = async () => {
      if (safeService && childSafeInfo?.daoAddress) {
        const { getAddress } = ethers.utils;
        setChildSafeBalance(await safeService.getBalances(getAddress(childSafeInfo.daoAddress)));
        if (parentAddress) {
          setParentSafeInfo(await safeService.getSafeInfo(getAddress(parentAddress)));
        }
      }
    };

    loadData();
  }, [childSafeInfo, safeService, parentAddress]);

  const handleClawBack = useCallback(async () => {
    if (canUserCreateProposal && parentAddress && childSafeInfo && parentSafeInfo) {
      const abiCoder = new ethers.utils.AbiCoder();
      const fractalModule = childSafeInfo.fractalModules!.find(
        module => module.moduleType === FractalModuleType.FRACTAL
      );
      const fractalModuleContract = fractalModule?.moduleContract as FractalModule;
      if (fractalModule) {
        const transactions = childSafeBalance.map(asset => {
          if (!asset.tokenAddress) {
            // Seems like we're operating with native coin i.e ETH
            const txData = abiCoder.encode(
              ['address', 'uint256', 'bytes', 'uint8'],
              [parentAddress, asset.balance, '0x', 0]
            );
            const fractalModuleCalldata = fractalModuleContract.interface.encodeFunctionData(
              'execTx',
              [txData]
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
            const txData = abiCoder.encode(
              ['address', 'uint256', 'bytes', 'uint8'],
              [asset.tokenAddress, 0, clawBackCalldata, 0]
            );
            const fractalModuleCalldata = fractalModuleContract.interface.encodeFunctionData(
              'execTx',
              [txData]
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
            title: t('Clawback Proposal', { ns: 'proposalMetadata' }),
            description: t('Transfer all funds from the targeted subDAO to our own treasury.', {
              ns: 'proposalMetadata',
            }),
            documentationUrl: '',
            targets: transactions.map(tx => tx.target),
            values: transactions.map(tx => tx.value),
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
  }, [
    canUserCreateProposal,
    childSafeInfo,
    childSafeBalance,
    parentAddress,
    parentSafeInfo,
    provider,
    submitProposal,
    t,
  ]);

  return { handleClawBack };
}
