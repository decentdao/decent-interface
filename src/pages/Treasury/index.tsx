import { ethers } from 'ethers';
import { ReactNode } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import ContentBanner from '../../components/ui/ContentBanner';
import ContentBoxTitle from '../../components/ui/ContentBoxTitle';
import EtherscanLinkAddress from '../../components/ui/EtherscanLinkAddress';
import EtherscanLinkNFT from '../../components/ui/EtherscanLinkNFT';
import EtherscanLinkToken from '../../components/ui/EtherscanLinkToken';
import H1 from '../../components/ui/H1';
import TooltipAddressContent from '../../components/ui/TooltipAddressContent';
import TooltipWrapper from '../../components/ui/TooltipWrapper';
import { useGnosisTreasuryInjector } from '../../controller/Modules/injectors/GnosisTreasuryInjectorContext';
import { useGnosis } from '../../providers/gnosis/hooks/useGnosis';

function TableRowWrapper({ children }: { children?: ReactNode }) {
  return (
    <div className="flex justify-between items-center bg-gray-500 px-4 py-5 border-t border-b border-gray-200">
      {children}
    </div>
  );
}

function Treasury() {
  const { gnosisAssetsFungible, gnosisAssetsNonFungible } = useGnosisTreasuryInjector();
  const { state } = useGnosis();

  const { t } = useTranslation('treasury');
  return (
    <div>
      <H1>{t('titleTreasury', { daoName: state.name })}</H1>
      <div className="rounded-lg p-4 shadow-2xl my-4 bg-gray-600">
        <ContentBoxTitle>{t('titleEthTokens')}</ContentBoxTitle>
        <div className="my-2">
          <div className="flex justify-between items-end bg-gray-400 px-4 pb-2 h-10">
            <div className="flex">
              <div className="text-gray-50 text-xs font-medium w-16 sm:w-28">
                {t('tokenSymbol')}
              </div>
              <div className="text-gray-50 text-xs font-medium">{t('tokenName')}</div>
            </div>
            <div className="text-gray-50 text-xs font-medium">{t('tokenAmount')}</div>
          </div>
          {gnosisAssetsFungible!.length === 0 && (
            <TableRowWrapper>
              <div className="text-gray-25 w-full flex justify-center">
                <Trans
                  i18nKey="emptyTokens"
                  ns="treasury"
                >
                  There are no tokens in this
                  <TooltipWrapper
                    className="text-gold-500 hover:text-gold-300 mx-2"
                    content={
                      <TooltipAddressContent
                        address={state.safeAddress ? state.safeAddress : ''}
                        title={t('titleTreasuryAddress')}
                      />
                    }
                    isVisible
                  >
                    treasury
                  </TooltipWrapper>
                  at this time.
                </Trans>
              </div>
            </TableRowWrapper>
          )}
          {gnosisAssetsFungible!.map(asset => {
            const address =
              asset.tokenAddress === null ? ethers.constants.AddressZero : asset.tokenAddress;
            const symbol = asset.token === null ? 'ETH' : asset.token.symbol;
            const name = asset.token === null ? 'ETHEREUM' : asset.token.symbol;
            const formattedTotal =
              asset.token === null
                ? ethers.utils.formatEther(asset.balance)
                : ethers.utils.formatUnits(asset.balance, asset.token.decimals);
            const fiatBalance = asset.fiatBalance;
            return (
              <TableRowWrapper key={address}>
                <div className="flex">
                  {address === ethers.constants.AddressZero ? (
                    <EtherscanLinkAddress address={state.safeAddress}>
                      <div className="text-gold-500 w-16 sm:w-28">{symbol}</div>
                    </EtherscanLinkAddress>
                  ) : (
                    <EtherscanLinkToken address={address}>
                      <div className="text-gold-500 w-16 sm:w-28">{symbol}</div>
                    </EtherscanLinkToken>
                  )}
                  <div className="text-gray-25 font-medium">{name}</div>
                </div>
                <div className="text-gray-25 font-mono font-semibold tracking-wider">
                  {fiatBalance &&
                    (() => {
                      return (
                        <TooltipWrapper
                          as="span"
                          className="text-gray-100 mr-2 text-sm"
                          content={`1 ${symbol} = ${asset.fiatConversion}`}
                          isVisible
                          placement="top-start"
                        >
                          {fiatBalance}
                        </TooltipWrapper>
                      );
                    })()}
                  {formattedTotal}
                </div>
              </TableRowWrapper>
            );
          })}
        </div>
        <div className="pt-2 px-4 text-xs text-right">
          <a
            className="text-gray-100"
            href="https://safe-transaction-mainnet.safe.global/"
            rel="noreferrer"
            target="_blank"
          >
            Data from Gnosis API
          </a>
        </div>
      </div>
      <div className="rounded-lg p-4 shadow-2xl my-4 bg-gray-600">
        <ContentBoxTitle>NFTs</ContentBoxTitle>
        <div className="my-2">
          <div className="flex justify-between items-end bg-gray-400 px-4 pb-2 h-10">
            <div className="flex">
              <div className="text-gray-50 text-xs font-medium w-16 sm:w-28">
                {t('tokenSymbol')}
              </div>
              <div className="text-gray-50 text-xs font-medium">{t('tokenName')}</div>
            </div>
            <div className="text-gray-50 text-xs font-medium">{t('tokenId')}</div>
          </div>
          {!gnosisAssetsNonFungible.length && (
            <TableRowWrapper>
              <div className="text-gray-25 w-full flex justify-center">
                <Trans
                  i18nKey="emptyNFTs"
                  ns="treasury"
                >
                  There are no NFTs in this
                  <TooltipWrapper
                    className="text-gold-500 hover:text-gold-300 mx-2"
                    content={
                      <TooltipAddressContent
                        address={state.safeAddress ? state.safeAddress : ''}
                        title="Treasury address:"
                      />
                    }
                    isVisible
                  >
                    treasury
                  </TooltipWrapper>
                  at this time.
                </Trans>
              </div>
            </TableRowWrapper>
          )}
          {gnosisAssetsNonFungible.map(asset => (
            <TableRowWrapper key={asset.address}>
              <div className="flex">
                <EtherscanLinkAddress address={asset.address}>
                  <div className="text-gold-500 truncate ... w-16 sm:w-28">{asset.tokenSymbol}</div>
                </EtherscanLinkAddress>
                <div className="text-gray-25 font-medium">{asset.tokenName}</div>
              </div>
              <div className="text-gray-25 font-mono font-semibold tracking-wider">
                <EtherscanLinkNFT
                  address={asset.address}
                  tokenId={asset.id.toString()}
                >
                  <div className="text-gray-25 font-mono font-semibold tracking-wider">
                    {asset.id.toString()}
                  </div>
                </EtherscanLinkNFT>
              </div>
            </TableRowWrapper>
          ))}
        </div>
      </div>
      {!gnosisAssetsFungible!.length && !gnosisAssetsNonFungible.length && (
        <div className="px-1">
          <ContentBanner description={t('descTreasury', { daoName: state.name })} />
        </div>
      )}
    </div>
  );
}

export default Treasury;
