import { ReactNode } from 'react';
import ContentBanner from '../../components/ui/ContentBanner';
import ContentBoxTitle from '../../components/ui/ContentBoxTitle';
import EtherscanLink from '../../components/ui/EtherscanLink';
import H1 from '../../components/ui/H1';
import TooltipAddressContent from '../../components/ui/TooltipAddressContent';
import TooltipWrapper from '../../components/ui/TooltipWrapper';
import { useDAOData } from '../../contexts/daoData';

function TableRowWrapper({ children }: { children?: ReactNode }) {
  return (
    <div className="flex justify-between items-center bg-gray-500 px-4 py-5 border-t border-b border-gray-200">
      {children}
    </div>
  );
}

function Treasury() {
  const [
    {
      name,
      modules: {
        treasury: { treasuryAssetsFungible, treasuryAssetsNonFungible, treasuryModuleContract },
      },
    },
  ] = useDAOData();
  return (
    <div>
      <H1>{name} Treasury</H1>
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
          {!treasuryAssetsFungible.length && (
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
          {treasuryAssetsFungible.map(asset => (
            <TableRowWrapper key={asset.contractAddress}>
              <div className="flex">
                <EtherscanLink address={asset.contractAddress}>
                  <div className="text-gold-500 w-16 sm:w-28">{asset.symbol}</div>
                </EtherscanLink>
                <div className="text-gray-25 font-medium">{asset.name}</div>
              </div>
              <div className="text-gray-25 font-mono font-semibold tracking-wider">
                {asset.formatedTotal}
              </div>
            </TableRowWrapper>
          ))}
        </div>
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
                <EtherscanLink address={asset.contractAddress}>
                  <div className="text-gold-500 w-16 sm:w-28">{asset.symbol}</div>
                </EtherscanLink>
                <div className="text-gray-25 font-medium">{asset.name}</div>
              </div>
              <div className="text-gray-25 font-mono font-semibold tracking-wider">
                <EtherscanLink
                  linkType={'nft'}
                  address={asset.contractAddress}
                  tokenId={asset.tokenId.toString()}
                >
                  <div className="text-gold-500 w-16 sm:w-28">{asset.tokenId.toString()}</div>
                </EtherscanLink>
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
