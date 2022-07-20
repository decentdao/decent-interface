import { Fragment, ReactNode, useState } from 'react';
import { useDAOData } from '../../../contexts/daoData';
import {
  TreasuryAssetFungible,
  TreasuryAssetNonFungible,
} from '../../../contexts/daoData/treasury/types';
import ContentBoxTitle from '../../ui/ContentBoxTitle';
import EtherscanLinkAddress from '../../ui/EtherscanLinkAddress';
import EtherscanLinkNFT from '../../ui/EtherscanLinkNFT';
import EtherscanLinkToken from '../../ui/EtherscanLinkToken';
import { TextButton } from '../../ui/forms/Button';
import Input from '../../ui/forms/Input';
import { Close } from '../../ui/svg/Close';

export type TokenToFund = {
  asset: TreasuryAssetFungible;
  amount: string;
};

export type NFTToFund = {
  asset: TreasuryAssetNonFungible;
  token_id: string;
};

// @todo create a resuable component
function TableRowWrapper({ children }: { children?: ReactNode }) {
  return (
    <div className="flex justify-between items-center bg-gray-500 px-4 py-5 border-t border-b border-gray-200">
      {children}
    </div>
  );
}

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
      <ContentBoxTitle>ETH / Tokens</ContentBoxTitle>

      <div className="my-2">
        <div className="flex mb-8">
          <select className="bg-gray-700 border border-gray-200 px-2 rounded-md min-w-32">
            {treasuryAssetsFungible.map((asset, index) => (
              <option
                key={asset.contractAddress}
                value={index}
                label={`${asset.symbol} | ${asset.name}`}
              ></option>
            ))}
          </select>
          <TextButton
            label="Add token"
            onClick={fundToken}
          />
        </div>
        <div className="grid grid-cols-treasury py-2">
          <div className="bg-gray-500 border-t border-b border-gray-200 py-2 px-4 text-gray-50 text-xs font-medium">
            Symbol
          </div>
          <div className="bg-gray-500 border-t border-b border-gray-200 py-2 px-4 text-gray-50 text-xs font-medium">
            Name
          </div>
          <div className="bg-gray-500 border-t border-b border-gray-200 py-2 px-4 text-gray-50 text-xs font-medium text-right">
            Total
          </div>
          <div className="bg-gray-500 border-t border-b border-gray-200 py-2 px-4 text-gray-50 text-xs font-medium text-right">
            Fund
          </div>
          <div className="bg-gray-500 border-t border-b border-gray-200 py-4 px-4 text-gray-50 text-xs font-medium text-center"></div>
        </div>
        {tokensToFund.map((tokenToFund, index) => (
          <div
            className="grid grid-cols-treasury grid-rows-treasury items-center py-2"
            key={index}
          >
            <EtherscanLinkToken address={tokenToFund.asset.contractAddress}>
              <div className="text-gold-500 w-16 sm:w-28 pl-4">{tokenToFund.asset.symbol}</div>
            </EtherscanLinkToken>
            <div className="pl-4 text-gray-25 font-medium">{tokenToFund.asset.name}</div>
            <div className="pr-4 text-gray-25 font-mono font-semibold tracking-wider text-right">
              {tokenToFund.asset.formatedTotal}
            </div>
            <Input
              containerClassName="-mb-4 pr-4"
              inputClassName="text-right"
              placeholder="0.000000000000000000"
              onClickMax={() => {}}
              type="number"
              onChange={e => onTokenFundChange(e.target.value, index)}
              max={tokenToFund.asset.formatedTotal}
              isFloatNumbers
            />
            <div
              className="text-center"
              onClick={() => removeTokenFund(index)}
            >
              <Close />
            </div>
          </div>
        ))}
        {/* {nftsToFund.map(asset => (
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
      ))} */}
      </div>
    </div>
  );
}
