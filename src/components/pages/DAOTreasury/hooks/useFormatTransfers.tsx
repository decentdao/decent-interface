import { AllTransactionsListResponse, TokenInfoResponse } from '@safe-global/api-kit';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import { TransferType } from '../../../../types';
import { formatCoin } from '../../../../utils/numberFormats';

export enum TokenEventType {
  DEPOSIT,
  WITHDRAW,
}
export interface TransferDisplayData {
  eventType: TokenEventType;
  transferType: TransferType;
  executionDate: string;
  image: string;
  assetDisplay: string;
  fullCoinTotal: string | undefined;
  transferAddress: string;
  isLast: boolean;
  transactionHash: string;
  tokenId: string;
  tokenInfo?: TokenInfoResponse;
}

export function useFormatTransfers(
  transactions: AllTransactionsListResponse['results'],
  safeAddress: string,
): TransferDisplayData[] {
  const transfers = transactions.map(transaction => transaction.transfers).flat();
  let displayData: TransferDisplayData[] = new Array(transfers.length);
  const { chain, nativeTokenIcon } = useNetworkConfig();

  for (let i = 0; i < transfers.length; i++) {
    const transfer = transfers[i];
    const info = transfer.tokenInfo;

    let imageSrc = '/images/coin-icon-default.svg';
    switch (transfer.type) {
      case TransferType.ERC20_TRANSFER:
      case TransferType.ERC721_TRANSFER:
        if (info?.logoUri) {
          imageSrc = info.logoUri;
        }
        break;
      case TransferType.ETHER_TRANSFER:
        imageSrc = nativeTokenIcon;
        break;
    }
    let symbol =
      transfer.type === TransferType.ETHER_TRANSFER
        ? chain.nativeCurrency.symbol
        : transfer?.tokenInfo?.symbol;
    const formatted: TransferDisplayData = {
      eventType: safeAddress === transfer.from ? TokenEventType.WITHDRAW : TokenEventType.DEPOSIT,
      transferType: transfer.type as TransferType,
      executionDate: transfer.executionDate,
      image: imageSrc,
      assetDisplay:
        transfer.type === TransferType.ERC721_TRANSFER
          ? info?.name + ' #' + transfer.tokenId
          : formatCoin(transfer.value, true, transfer?.tokenInfo?.decimals, symbol),
      fullCoinTotal:
        transfer.type === TransferType.ERC721_TRANSFER
          ? undefined
          : formatCoin(transfer.value, false, transfer?.tokenInfo?.decimals, symbol),
      transferAddress: safeAddress === transfer.from ? transfer.to : transfer.from,
      isLast: transfers[transfers.length - 1] === transfer,
      transactionHash: transfer.transactionHash,
      tokenId: transfer?.tokenId,
      tokenInfo: transfer.tokenInfo,
    };
    displayData[i] = formatted;
  }
  return displayData;
}
