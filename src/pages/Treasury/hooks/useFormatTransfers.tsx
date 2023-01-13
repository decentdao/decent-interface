import coinDefault from '../../../assets/images/coin-icon-default.svg';
import ethDefault from '../../../assets/images/coin-icon-eth.svg';
import { TransferType, TokenInfo, AssetTransfer } from '../../../providers/Fractal/types';
import { formatCoin } from '../../../utils/numberFormats';

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

  for (let i = 0; i < transfers.length; i++) {
    let transfer = transfers[i];

    let imageSrc;
    switch (transfer.type) {
      case TransferType.ERC20_TRANSFER:
      case TransferType.ERC721_TRANSFER:
        imageSrc = transfer.tokenInfo?.logoUri;
        break;
      case TransferType.ETHER_TRANSFER:
        imageSrc = ethDefault;
        break;
      default:
        imageSrc = coinDefault;
    }

    const formatted: TransferDisplayData = {
      eventType: safeAddress === transfer.from ? TokenEventType.WITHDRAW : TokenEventType.DEPOSIT,
      transferType: transfer.type as TransferType,
      executionDate: transfer.executionDate,
      image: imageSrc,
      assetDisplay:
        transfer.type === TransferType.ERC721_TRANSFER
          ? transfer.tokenInfo.name + ' #' + transfer.tokenId
          : formatCoin(
              transfer.value,
              true,
              transfer?.tokenInfo?.decimals,
              transfer?.tokenInfo?.symbol
            ),
      fullCoinTotal:
        transfer.type === TransferType.ERC721_TRANSFER
          ? undefined
          : formatCoin(
              transfer.value,
              false,
              transfer?.tokenInfo?.decimals,
              transfer?.tokenInfo?.symbol
            ),
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
