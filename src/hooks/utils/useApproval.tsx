import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAddress, getContract, maxUint256 } from 'viem';
import { useAccount, useWalletClient } from 'wagmi';
import VotesERC20Abi from '../../assets/abi/VotesERC20';
import { useTransaction } from './useTransaction';

const useApproval = (tokenAddress?: string, spenderAddress?: string, userBalance?: bigint) => {
  const { address: account } = useAccount();
  const [allowance, setAllowance] = useState(0n);
  const [approved, setApproved] = useState(false);
  const [pending, contractCallViem] = useTransaction();
  const { t } = useTranslation('treasury');
  const { data: walletClient } = useWalletClient();

  const tokenContract = useMemo(() => {
    if (!walletClient || !tokenAddress) {
      return;
    }

    return getContract({
      abi: VotesERC20Abi,
      address: getAddress(tokenAddress),
      client: walletClient,
    });
  }, [tokenAddress, walletClient]);

  const fetchAllowance = useCallback(async () => {
    if (!account || !spenderAddress || !tokenContract) return;

    const userAllowance = await tokenContract.read.allowance([account, getAddress(spenderAddress)]);
    setAllowance(userAllowance);
  }, [account, tokenContract, spenderAddress]);

  const approveTransaction = useCallback(async () => {
    if (!tokenContract || !account || !spenderAddress) return;

    contractCallViem({
      contractFn: () => tokenContract.write.approve([getAddress(spenderAddress), maxUint256]),
      pendingMessage: t('approvalPendingMessage'),
      failedMessage: t('approvalFailedMessage'),
      successMessage: t('approvalSuccessMessage'),
      successCallback: () => {
        setApproved(true);
      },
    });
  }, [account, contractCallViem, tokenContract, spenderAddress, t]);

  useEffect(() => {
    fetchAllowance();
  }, [fetchAllowance]);

  useEffect(() => {
    setApproved(allowance !== 0n || (!!userBalance && userBalance <= allowance));
  }, [allowance, userBalance]);

  return { approved, allowance, approveTransaction, pending };
};

export default useApproval;
