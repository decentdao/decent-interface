import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { maxUint256 } from 'viem';
import { useAccount } from 'wagmi';
import { VotesERC20, VotesERC20Wrapper } from '../../types';
import { useTransaction } from './useTransaction';

const useApproval = (
  tokenContract?: VotesERC20 | VotesERC20Wrapper,
  spenderAddress?: string,
  userBalance?: bigint,
) => {
  const { address: account } = useAccount();
  const [allowance, setAllowance] = useState(0n);
  const [approved, setApproved] = useState(false);
  const [contractCall, pending] = useTransaction();
  const { t } = useTranslation('treasury');

  const fetchAllowance = useCallback(async () => {
    if (!tokenContract || !account || !spenderAddress) return;

    const userAllowance = await tokenContract.read.allowance([account, spenderAddress]);
    setAllowance(userAllowance as bigint);
  }, [account, tokenContract, spenderAddress]);

  const approveTransaction = useCallback(async () => {
    if (!tokenContract || !account || !spenderAddress) return;

    contractCall({
      contractFn: () => tokenContract.write.approve([spenderAddress, maxUint256]),
      pendingMessage: t('approvalPendingMessage'),
      failedMessage: t('approvalFailedMessage'),
      successMessage: t('approvalSuccessMessage'),
      successCallback: () => {
        setApproved(true);
      },
    });
  }, [account, contractCall, tokenContract, spenderAddress, t]);

  useEffect(() => {
    fetchAllowance();
  }, [fetchAllowance]);

  useEffect(() => {
    setApproved(allowance !== 0n || (!!userBalance && userBalance <= allowance));
  }, [allowance, userBalance]);

  return { approved, allowance, approveTransaction, pending };
};

export default useApproval;
