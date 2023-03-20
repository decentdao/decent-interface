import { useNetworkConfg } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import { TransferType, TokenInfo, AssetTransfer } from '../../../../types';
import { formatCoin } from '../../../../utils/numberFormats';
import coinDefault from '../../../assets/images/coin-icon-default.svg';

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
  tokenInfo: TokenInfo;
}

export function useFormatTransfers(
  transfers: AssetTransfer[],
  safeAddress: string
): TransferDisplayData[] {
  let displayData: TransferDisplayData[] = new Array(transfers.length);
  const { nativeTokenSymbol, nativeTokenIcon } = useNetworkConfg();

  for (let i = 0; i < transfers.length; i++) {
    let transfer = transfers[i];

    let imageSrc;
    switch (transfer.type) {
      case TransferType.ERC20_TRANSFER:
      case TransferType.ERC721_TRANSFER:
        imageSrc = transfer.tokenInfo?.logoUri;
        break;
      case TransferType.ETHER_TRANSFER:
        imageSrc = nativeTokenIcon;
        break;
      default:
        imageSrc = coinDefault;
    }
    let symbol = transfer.tokenInfo === null ? nativeTokenSymbol : transfer.tokenInfo.symbol;
    const formatted: TransferDisplayData = {
      eventType: safeAddress === transfer.from ? TokenEventType.WITHDRAW : TokenEventType.DEPOSIT,
      transferType: transfer.type as TransferType,
      executionDate: transfer.executionDate,
      image: imageSrc,
      assetDisplay:
        transfer.type === TransferType.ERC721_TRANSFER
          ? transfer.tokenInfo.name + ' #' + transfer.tokenId
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
