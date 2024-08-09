import { TokenInfoResponse } from '@safe-global/api-kit';
import { Address, getAddress } from 'viem';
import { useFractal } from '../../../../providers/App/AppProvider';
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
  transferAddress: Address;
  isLast: boolean;
  transactionHash: string;
  tokenId: string;
  tokenInfo?: TokenInfoResponse;
}

export function useFormatTransfers(): TransferDisplayData[] {
  const {
    node: { safe },
    treasury: { transfers },
  } = useFractal();

  const daoAddress = safe?.address;

  const transfersFromTransactions = (transfers?.results || [])
    .map(transaction => transaction.transfers)
    .flat();
  let displayData: TransferDisplayData[] = new Array(transfersFromTransactions.length);
  const { chain, nativeTokenIcon } = useNetworkConfig();

  for (let i = 0; i < transfersFromTransactions.length; i++) {
    const transfer = transfersFromTransactions[i];
    const info: TokenInfoResponse | null = transfer.tokenInfo; // SDK says type here always exists, but in fact - it might be null

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
      transfer.type === TransferType.ETHER_TRANSFER ? chain.nativeCurrency.symbol : info?.symbol;
    const formatted: TransferDisplayData = {
      eventType: daoAddress === transfer.from ? TokenEventType.WITHDRAW : TokenEventType.DEPOSIT,
      transferType: transfer.type as TransferType,
      executionDate: transfer.executionDate,
      image: imageSrc,
      assetDisplay:
        transfer.type === TransferType.ERC721_TRANSFER
          ? info?.name + ' #' + transfer.tokenId
          : formatCoin(transfer.value, true, info?.decimals, symbol),
      fullCoinTotal:
        transfer.type === TransferType.ERC721_TRANSFER
          ? undefined
          : formatCoin(transfer.value, false, info?.decimals, symbol),
      transferAddress: getAddress(daoAddress === transfer.from ? transfer.to : transfer.from),
      isLast: transfersFromTransactions[transfersFromTransactions.length - 1] === transfer,
      transactionHash: transfer.transactionHash,
      tokenId: transfer.tokenId,
      tokenInfo: transfer.tokenInfo,
    };
    displayData[i] = formatted;
  }
  return displayData;
}
