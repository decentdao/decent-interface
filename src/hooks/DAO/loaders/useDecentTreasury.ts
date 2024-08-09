import { TokenInfoResponse } from '@safe-global/api-kit';
import { useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { getAddress } from 'viem';
import { useFractal } from '../../../providers/App/AppProvider';
import useBalancesAPI from '../../../providers/App/hooks/useBalancesAPI';
import { useSafeAPI } from '../../../providers/App/hooks/useSafeAPI';
import { TreasuryAction } from '../../../providers/App/treasury/action';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import {
  TokenEventType,
  TransferDisplayData,
  TransferType,
  TransferWithTokenInfo,
} from '../../../types';
import { formatCoin } from '../../../utils';
import { useUpdateTimer } from '../../utils/useUpdateTimer';

export const useDecentTreasury = () => {
  // tracks the current valid DAO address / chain; helps prevent unnecessary calls
  const loadKey = useRef<string | null>();
  const {
    node: { daoAddress },
    action,
  } = useFractal();
  const safeAPI = useSafeAPI();
  const { getTokenBalances, getNFTBalances } = useBalancesAPI();

  const { chain, nativeTokenIcon } = useNetworkConfig();

  const { setMethodOnInterval, clearIntervals } = useUpdateTimer(daoAddress);

  const formatTransfer = useCallback(
    ({ transfer, isLast }: { transfer: TransferWithTokenInfo; isLast: boolean }) => {
      const symbol = transfer.tokenInfo.symbol;
      const decimals = transfer.tokenInfo.decimals;

      const formattedTransfer: TransferDisplayData = {
        eventType: daoAddress === transfer.from ? TokenEventType.WITHDRAW : TokenEventType.DEPOSIT,
        transferType: transfer.type as TransferType,
        executionDate: transfer.executionDate,
        image: transfer.tokenInfo.logoUri ?? '/images/coin-icon-default.svg',
        assetDisplay:
          transfer.type === TransferType.ERC721_TRANSFER
            ? `${transfer.tokenInfo.name} #${transfer.tokenId}`
            : formatCoin(transfer.value, true, decimals, symbol),
        fullCoinTotal:
          transfer.type === TransferType.ERC721_TRANSFER
            ? undefined
            : formatCoin(transfer.value, false, decimals, symbol),
        transferAddress: daoAddress === transfer.from ? transfer.to : transfer.from,
        transactionHash: transfer.transactionHash,
        tokenId: transfer.tokenId,
        tokenInfo: transfer.tokenInfo,
        isLast,
      };
      return formattedTransfer;
    },
    [daoAddress],
  );

  const loadTreasury = useCallback(async () => {
    if (!daoAddress || !safeAPI) {
      return;
    }

    const [
      transfers,
      { data: tokenBalances, error: tokenBalancesError },
      { data: nftBalances, error: nftBalancesError },
    ] = await Promise.all([
      safeAPI.getIncomingTransactions(daoAddress),
      getTokenBalances(daoAddress),
      getNFTBalances(daoAddress),
    ]);

    if (tokenBalancesError) {
      toast(tokenBalancesError, { autoClose: 2000 });
    }
    if (nftBalancesError) {
      toast(nftBalancesError, { autoClose: 2000 });
    }
    const assetsFungible = tokenBalances || [];
    const assetsNonFungible = nftBalances || [];

    const totalUsdValue = assetsFungible.reduce((prev, curr) => prev + (curr.usdValue || 0), 0);

    const transfersWithTokenInfo = await Promise.all(
      transfers.results.map(async (transfer, _, _transfers) => {
        let tokenData: TokenInfoResponse | undefined;
        if (transfer.tokenAddress) {
          tokenData = await safeAPI.getToken(getAddress(transfer.tokenAddress));
        }
        // @note When would there be a transfer with no token address? Should this just throw an error?
        tokenData = {
          address: '0x',
          name: chain.nativeCurrency.name,
          symbol: chain.nativeCurrency.symbol,
          decimals: chain.nativeCurrency.decimals,
          logoUri: nativeTokenIcon,
        };
        const formattedTransfer: TransferDisplayData = formatTransfer({
          transfer: { ...transfer, tokenInfo: tokenData },
          isLast: _transfers[_transfers.length - 1] === transfer,
        });
        return formattedTransfer;
      }),
    );
    const treasuryData = {
      assetsFungible,
      assetsNonFungible,
      transfers: transfersWithTokenInfo,
      totalUsdValue,
    };
    action.dispatch({ type: TreasuryAction.UPDATE_TREASURY, payload: treasuryData });
  }, [
    daoAddress,
    safeAPI,
    action,
    getTokenBalances,
    getNFTBalances,
    formatTransfer,
    chain,
    nativeTokenIcon,
  ]);

  useEffect(() => {
    if (daoAddress && chain.id + daoAddress !== loadKey.current) {
      loadKey.current = chain.id + daoAddress;
      setMethodOnInterval(loadTreasury);
    }
    if (!daoAddress) {
      loadKey.current = null;
      clearIntervals();
    }
  }, [chain, daoAddress, loadTreasury, setMethodOnInterval, clearIntervals]);

  return;
};
