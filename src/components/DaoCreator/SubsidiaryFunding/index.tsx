import { BigNumber, utils } from 'ethers';
import { useState } from 'react';
import { useTreasuryInjector } from '../../../controller/Modules/injectors/TreasuryInjectorContext';
import ContentBox from '../../ui/ContentBox';
import ContentBoxTitle from '../../ui/ContentBoxTitle';
import EtherscanLinkAddress from '../../ui/EtherscanLinkAddress';
import EtherscanLinkNFT from '../../ui/EtherscanLinkNFT';
import EtherscanLinkToken from '../../ui/EtherscanLinkToken';
import Input, { RestrictCharTypes } from '../../ui/forms/Input';
import { Close } from '../../ui/svg/Close';
import { TableRow } from '../../ui/table';
import { TableBodyRowItem } from '../../ui/table/TableBodyRow';
import { FundingTableHeader, NFTFundingTableHeader } from '../../ui/table/TableHeaders';
import { useCreator } from '../provider/hooks/useCreator';
import { CreatorProviderActions } from '../provider/types';
import { FundingOptions } from './FundingOptions';

export function SubsidiaryFunding() {
  const {
    state: { funding, essentials },
    dispatch,
  } = useCreator();

  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number>();
  const [selectedNFTIndex, setSelectedNFTIndex] = useState<number>();
  const { treasuryAssetsFungible, treasuryAssetsNonFungible } = useTreasuryInjector();

  const fieldUpdate = (value: any, field: string) => {
    dispatch({
      type: CreatorProviderActions.UPDATE_FUNDING,
      payload: {
        [field]: value,
      },
    });
  };

  const onTokenFundChange = (value: string, changedTokenIndex: number) => {
    const assets = funding.tokensToFund.map((tokenToFund, i) => {
      if (i === changedTokenIndex) {
        const tokenIndex = treasuryAssetsFungible.findIndex(
          v => v.contractAddress === tokenToFund.asset.contractAddress
        );
        const token = treasuryAssetsFungible[tokenIndex];
        const valueBigNumber = utils.parseUnits(value, token.decimals);
        if (valueBigNumber.gte(token.totalAmount)) {
          return {
            ...tokenToFund,
            amount: { value: token.formatedTotal, bigNumberValue: token.totalAmount },
          };
        } else {
          return {
            ...tokenToFund,
            amount: { value: value, bigNumberValue: valueBigNumber },
          };
        }
      }
      return tokenToFund;
    });
    fieldUpdate(assets, 'tokensToFund');
  };

  const addToken = () => {
    if (selectedTokenIndex === undefined) {
      return;
    }
    const asset = treasuryAssetsFungible[selectedTokenIndex];
    fieldUpdate(
      [
        ...funding.tokensToFund,
        {
          asset,
          amount: {
            value: '',
            bigNumberValue: BigNumber.from(0),
          },
        },
      ],
      'tokensToFund'
    );
  };

  const removeTokenFund = (index: number) => {
    fieldUpdate(
      funding.tokensToFund.filter((_, i) => index !== i),
      'tokensToFund'
    );
  };

  const selectToken = (index?: number) => {
    setSelectedTokenIndex(index);
  };

  const maxFundToken = (index: number) => {
    const assets = funding.tokensToFund.map((tokenToFund, i) => {
      if (i === index) {
        return {
          ...tokenToFund,
          amount: {
            value: tokenToFund.asset.formatedTotal,
            bigNumberValue: tokenToFund.asset.totalAmount,
          },
        };
      }
      return tokenToFund;
    });
    fieldUpdate(assets, 'tokensToFund');
  };

  const selectNFT = (index?: number) => {
    setSelectedNFTIndex(index);
  };

  const moveNFT = () => {
    if (selectedNFTIndex === undefined) {
      return;
    }
    const asset = treasuryAssetsNonFungible[selectedNFTIndex];
    if (selectedNFTIndex === undefined) {
      return;
    }
    fieldUpdate(
      [
        ...funding.nftsToFund,
        {
          asset,
        },
      ],
      'nftsToFund'
    );
  };

  const removeNFTFund = (index: number) => {
    fieldUpdate(
      funding.nftsToFund.filter((_, i) => index !== i),
      'nftsToFund'
    );
  };

  return (
    <div>
      <FundingOptions
        selectedTokenIndex={selectedTokenIndex}
        selectToken={selectToken}
        addToken={addToken}
        tokensToFund={funding.tokensToFund}
        moveNFT={moveNFT}
        selectedNFTIndex={selectedNFTIndex}
        selectNFT={selectNFT}
        nftsToFund={funding.nftsToFund}
      />
      <ContentBox title={`${essentials.daoName} Treasury`}>
        <div className="my-2">
          <ContentBoxTitle>Tokens</ContentBoxTitle>
          <FundingTableHeader />
          {!funding.tokensToFund.length && (
            <TableBodyRowItem>
              <div className="flex items-center justify-center h-full w-full">
                Add Tokens from your parent treasury above.
              </div>
            </TableBodyRowItem>
          )}
          {funding.tokensToFund.map((tokenToFund, index) => (
            <TableRow
              gridType="grid-cols-funding-token"
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
                onClickMax={() => maxFundToken(index)}
                type="number"
                value={tokenToFund.amount.value}
                onChange={e => onTokenFundChange(e.target.value, index)}
                restrictChar={RestrictCharTypes.FLOAT_NUMBERS}
                decimals={tokenToFund.asset.decimals}
              />
              <div onClick={() => removeTokenFund(index)}>
                <Close />
              </div>
            </TableRow>
          ))}
        </div>
        <div className="mt-4">
          <ContentBoxTitle>NFTs</ContentBoxTitle>
          <NFTFundingTableHeader />
          {!funding.nftsToFund.length && (
            <TableBodyRowItem>
              <div className="flex items-center justify-center h-full w-full">
                Add NFTs from your parent treasury above.
              </div>
            </TableBodyRowItem>
          )}
          {funding.nftsToFund.map((nftToFund, index) => (
            <TableRow
              gridType="grid-cols-funding-nft"
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
              <div onClick={() => removeNFTFund(index)}>
                <Close />
              </div>
            </TableRow>
          ))}
        </div>
      </ContentBox>
    </div>
  );
}
