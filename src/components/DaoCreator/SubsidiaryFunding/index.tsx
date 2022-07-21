import { useState } from 'react';
import { useDAOData } from '../../../contexts/daoData';
import {
  TreasuryAssetFungible,
  TreasuryAssetNonFungible,
} from '../../../contexts/daoData/treasury/types';
import ContentBox from '../../ui/ContentBox';
import ContentBoxTitle from '../../ui/ContentBoxTitle';
import EtherscanLinkAddress from '../../ui/EtherscanLinkAddress';
import EtherscanLinkNFT from '../../ui/EtherscanLinkNFT';
import EtherscanLinkToken from '../../ui/EtherscanLinkToken';
import Input from '../../ui/forms/Input';
import { Close } from '../../ui/svg/Close';
import { TableRow } from '../../ui/table';
import { TableBodyRowItem } from '../../ui/table/TableBodyRow';
import { FundingTableHeader } from '../../ui/table/TableHeaders';
import { FundingOptions } from './FundingOptions';

export type TokenToFund = {
  asset: TreasuryAssetFungible;
  amount: string;
};

export type NFTToFund = {
  asset: TreasuryAssetNonFungible;
  token_id: string;
};

export function SubsidiaryFunding() {
  const [tokensToFund, setTokensToFund] = useState<TokenToFund[]>([]);
  const [nftsToFund, setnftsToFund] = useState<NFTToFund[]>([]);
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number>(0);
  const [
    {
      modules: {
        treasury: { treasuryAssetsFungible, treasuryAssetsNonFungible, treasuryModuleContract },
      },
    },
  ] = useDAOData();

  // @todo Input should be max validationat = asset amount
  // @todo align input add padding

  const fundToken = () => {
    const asset = treasuryAssetsFungible[selectedTokenIndex];
    // @todo check if token is already funded
    setTokensToFund(funds => [
      ...funds,
      {
        asset,
        amount: '',
      },
    ]);
  };

  const removeTokenFund = (index: number) => {
    setTokensToFund(tokens => tokens.filter((_, i) => index !== i));
  };

  const onTokenFundChange = (value: string, index: number) => {
    const assets = tokensToFund.map((asset, i) => {
      if (i === index) {
        return { ...asset, amount: value };
      }
      return asset;
    });
    setTokensToFund(assets);
  };

  const fundNFT = () => {};

  const removeNFTFund = () => {};

  return (
    <div>
      <FundingOptions fundToken={fundToken} />
      <ContentBox title="<SubDAO> Treasury">
        <div className="my-2">
          <ContentBoxTitle>Tokens</ContentBoxTitle>
          <FundingTableHeader />
          {!tokensToFund.length && (
            <TableBodyRowItem>
              <div className="flex items-center justify-center h-full w-full">
                Add Tokens from your parent treasury above.
              </div>
            </TableBodyRowItem>
          )}
          {tokensToFund.map((tokenToFund, index) => (
            <TableRow
              gridType="treasury"
              key={tokenToFund.asset.contractAddress}
            >
              <EtherscanLinkToken address={tokenToFund.asset.contractAddress}>
                <div className="text-gold-500 w-16 sm:w-28 pl-4">{tokenToFund.asset.symbol}</div>
              </EtherscanLinkToken>
              <div className="pl-4 text-gray-25 font-medium">{tokenToFund.asset.name}</div>
              <div className="pr-4 text-gray-25 font-mono font-semibold tracking-wider text-right">
                {tokenToFund.asset.formatedTotal}
              </div>
              <Input
                containerClassName="-mb-5 pr-4"
                placeholder="0.000000000000000000"
                onClickMax={() => {}}
                type="number"
                onChange={e => onTokenFundChange(e.target.value, index)}
                max={tokenToFund.asset.formatedTotal}
                isFloatNumbers
              />
              <div onClick={() => removeTokenFund(index)}>
                <Close />
              </div>
            </TableRow>
          ))}
        </div>
        <div className="mt-4">
          <ContentBoxTitle>NFTs</ContentBoxTitle>
          <FundingTableHeader />
          {!tokensToFund.length && (
            <TableBodyRowItem>
              <div className="flex items-center justify-center h-full w-full">
                Add NFTs from your parent treasury above.
              </div>
            </TableBodyRowItem>
          )}
          {nftsToFund.map(nftToFund => (
            <TableRow
              gridType="treasury"
              key={nftToFund.asset.contractAddress}
            >
              <div className="flex">
                <EtherscanLinkAddress address={nftToFund.asset.contractAddress}>
                  <div className="text-gold-500 truncate ... w-16 sm:w-28">
                    {nftToFund.asset.symbol}
                  </div>
                </EtherscanLinkAddress>
                <div className="text-gray-25 font-medium">{nftToFund.asset.name}</div>
              </div>
              <div className="text-gray-25 font-mono font-semibold tracking-wider">
                <EtherscanLinkNFT
                  address={nftToFund.asset.contractAddress}
                  tokenId={nftToFund.asset.tokenId.toString()}
                >
                  <div className="text-gray-25 font-mono font-semibold tracking-wider">
                    {nftToFund.asset.tokenId.toString()}
                  </div>
                </EtherscanLinkNFT>
              </div>
            </TableRow>
          ))}
        </div>
      </ContentBox>
    </div>
  );
}
