import { ReactNode, useMemo } from 'react';
import ContentBanner from '../../components/ui/ContentBanner';
import ContentBoxTitle from '../../components/ui/ContentBoxTitle';
import EtherscanLinkAddress from '../../components/ui/EtherscanLinkAddress';
import EtherscanLinkNFT from '../../components/ui/EtherscanLinkNFT';
import EtherscanLinkToken from '../../components/ui/EtherscanLinkToken';
import H1 from '../../components/ui/H1';
import TooltipAddressContent from '../../components/ui/TooltipAddressContent';
import TooltipWrapper from '../../components/ui/TooltipWrapper';
import { useFractal } from '../../providers/fractal/hooks/useFractal';
import { useTreasuryModule } from '../../providers/treasury/hooks/useTreasuryModule';

function TableRowWrapper({ children }: { children?: ReactNode }) {
  return (
    <div className="flex justify-between items-center bg-gray-500 px-4 py-5 border-t border-b border-gray-200">
      {children}
    </div>
  );
}

function Treasury() {
  const {
    selectedCurrency,
    treasuryAssetsFungible,
    treasuryAssetsFungiblePrices,
    treasuryAssetsFungibleFiatAmounts,
    treasuryAssetsNonFungible,
    treasuryModuleContract,
  } = useTreasuryModule();
  const { dao } = useFractal();

  const isCoinGeckoAttributionVisible = useMemo(
    () => Object.keys(treasuryAssetsFungibleFiatAmounts).length > 0,
    [treasuryAssetsFungibleFiatAmounts]
  );

  return (
    <div>
      <H1>{dao.daoName} Treasury</H1>
      <div className="rounded-lg p-4 shadow-2xl my-4 bg-gray-600">
        <ContentBoxTitle>ETH / Tokens</ContentBoxTitle>
        <div className="my-2">
          <div className="flex justify-between items-end bg-gray-400 px-4 pb-2 h-10">
            <div className="flex">
              <div className="text-gray-50 text-xs font-medium w-16 sm:w-28">Symbol</div>
              <div className="text-gray-50 text-xs font-medium">Name</div>
            </div>
            <div className="text-gray-50 text-xs font-medium">Amount</div>
          </div>
          {treasuryAssetsFungible.length === 0 && (
            <TableRowWrapper>
              <div className="text-gray-25 w-full flex justify-center">
                <span>There are no tokens in this</span>
                <TooltipWrapper
                  content={
                    <TooltipAddressContent
                      address={treasuryModuleContract ? treasuryModuleContract.address : ''}
                      title="Treasury address:"
                    />
                  }
                  isVisible
                >
                  <span className="text-gold-500 hover:text-gold-300 mx-2">treasury</span>
                </TooltipWrapper>{' '}
                <span>at this time.</span>
              </div>
            </TableRowWrapper>
          )}
          {treasuryAssetsFungible.map(asset => {
            const fiatAmount = treasuryAssetsFungibleFiatAmounts[asset.contractAddress];

            return (
              <TableRowWrapper key={asset.contractAddress}>
                <div className="flex">
                  <EtherscanLinkToken address={asset.contractAddress}>
                    <div className="text-gold-500 w-16 sm:w-28">{asset.symbol}</div>
                  </EtherscanLinkToken>
                  <div className="text-gray-25 font-medium">{asset.name}</div>
                </div>
                <div className="text-gray-25 font-mono font-semibold tracking-wider">
                  {fiatAmount &&
                    (() => {
                      const price = treasuryAssetsFungiblePrices[asset.contractAddress];
                      const { currency: formattedPricePerToken } = price[selectedCurrency];
                      const { currency } = fiatAmount[selectedCurrency];

                      return (
                        <TooltipWrapper
                          as="span"
                          className="text-gray-100 mr-2 text-sm"
                          content={`1 ${asset.symbol} = ${formattedPricePerToken}`}
                          isVisible
                          placement="top-start"
                        >
                          ({currency})
                        </TooltipWrapper>
                      );
                    })()}
                  {asset.formattedTotal}
                </div>
              </TableRowWrapper>
            );
          })}
        </div>
        {isCoinGeckoAttributionVisible && (
          <div className="pt-2 px-4 text-xs text-right">
            <a
              className="text-gray-100"
              href="https://coingecko.com/"
              rel="noreferrer"
              target="_blank"
            >
              Data from CoinGecko
            </a>
          </div>
        )}
      </div>
      <div className="rounded-lg p-4 shadow-2xl my-4 bg-gray-600">
        <ContentBoxTitle>NFTs</ContentBoxTitle>
        <div className="my-2">
          <div className="flex justify-between items-end bg-gray-400 px-4 pb-2 h-10">
            <div className="flex">
              <div className="text-gray-50 text-xs font-medium w-16 sm:w-28">Symbol</div>
              <div className="text-gray-50 text-xs font-medium">Name</div>
            </div>
            <div className="text-gray-50 text-xs font-medium">Token Id</div>
          </div>
          {!treasuryAssetsNonFungible.length && (
            <TableRowWrapper>
              <div className="text-gray-25 w-full flex justify-center">
                <span>There are no NFTs in this</span>
                <TooltipWrapper
                  content={
                    <TooltipAddressContent
                      address={treasuryModuleContract ? treasuryModuleContract.address : ''}
                      title="Treasury address:"
                    />
                  }
                  isVisible
                >
                  <span className="text-gold-500 hover:text-gold-300 mx-2">treasury</span>
                </TooltipWrapper>{' '}
                <span>at this time.</span>
              </div>
            </TableRowWrapper>
          )}
          {treasuryAssetsNonFungible.map(asset => (
            <TableRowWrapper key={asset.contractAddress}>
              <div className="flex">
                <EtherscanLinkAddress address={asset.contractAddress}>
                  <div className="text-gold-500 truncate ... w-16 sm:w-28">{asset.symbol}</div>
                </EtherscanLinkAddress>
                <div className="text-gray-25 font-medium">{asset.name}</div>
              </div>
              <div className="text-gray-25 font-mono font-semibold tracking-wider">
                <EtherscanLinkNFT
                  address={asset.contractAddress}
                  tokenId={asset.tokenId.toString()}
                >
                  <div className="text-gray-25 font-mono font-semibold tracking-wider">
                    {asset.tokenId.toString()}
                  </div>
                </EtherscanLinkNFT>
              </div>
            </TableRowWrapper>
          ))}
        </div>
      </div>
      {!treasuryAssetsFungible.length && !treasuryAssetsNonFungible.length && (
        <div className="px-1">
          <ContentBanner
            description={`Here you will see the tokens that have been sent to the ${name} Treasury address.`}
          />
        </div>
      )}
    </div>
  );
}

export default Treasury;
