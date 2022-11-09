import { ethers } from 'ethers';
import { useTranslation } from 'react-i18next';
import coinDefault from '../../assets/images/coin-icon-default.svg';
import ethDefault from '../../assets/images/coin-icon-eth.svg';
import { formatDatesDiffReadable } from '../../helpers/dateTime';
import {
  AssetTransfer,
  GnosisAssetFungible,
  TokenInfo,
  TransferType,
} from '../../providers/fractal/types';
import { formatCoin, formatUSD } from '../../utils/numberFormats';

export interface TokenDisplayData {
  iconUri: string;
  address: string;
  symbol: string;
  truncatedCoinTotal: string;
  fullCoinTotal: string;
  fiatValue: number;
  fiatDisplayValue: string;
  fiatConversion: string;
}

export function formatCoins(assets: GnosisAssetFungible[]) {
  let totalFiatValue = 0;
  let displayData: TokenDisplayData[] = new Array(assets.length);
  for (let i = 0; i < assets.length; i++) {
    let asset = assets[i];
    totalFiatValue += Number(asset.fiatBalance);
    let symbol = asset.token === null ? 'ETH' : asset.token.symbol;
    const formatted: TokenDisplayData = {
      iconUri: asset.token === null ? ethDefault : asset.token.logoUri,
      address: asset.tokenAddress === null ? ethers.constants.AddressZero : asset.tokenAddress,
      truncatedCoinTotal: formatCoin(
        asset.balance,
        true,
        asset?.token?.decimals,
        asset?.token?.symbol
      ),
      fiatValue: Number(asset.fiatBalance),
      symbol: symbol,
      fiatConversion: `1 ${symbol} = ${formatUSD(Number(asset.fiatConversion))}`,
      fullCoinTotal: formatCoin(asset.balance, false, asset?.token?.decimals, asset?.token?.symbol),
      fiatDisplayValue: formatUSD(Number(asset.fiatBalance)),
    };
    displayData[i] = formatted;
  }
  displayData.sort((a, b) => b.fiatValue - a.fiatValue); // sort by USD value
  return {
    totalFiatValue: totalFiatValue,
    displayData: displayData,
  };
}

export enum TokenEventType {
  DEPOSIT,
  WITHDRAW,
}

export interface TransferDisplayData {
  eventType: TokenEventType;
  transferType: TransferType;
  dateTimeDisplay: string;
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
  const { t } = useTranslation('common');

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
      transferType: transfer.type,
      dateTimeDisplay: formatDatesDiffReadable(new Date(transfer.executionDate), new Date(), t),
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
