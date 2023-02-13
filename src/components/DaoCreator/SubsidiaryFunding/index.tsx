import { Button, InputGroup, InputRightElement } from '@chakra-ui/react';
import { CloseSolid } from '@decent-org/fractal-ui';
import { BigNumber } from 'ethers';
import { useState } from 'react';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';
import ContentBox from '../../ui/containers/ContentBox';
import ContentBoxTitle from '../../ui/containers/ContentBox/ContentBoxTitle';
import { BigNumberInput, BigNumberValuePair } from '../../ui/forms/BigNumberInput';
import EtherscanLinkAddress from '../../ui/links/EtherscanLinkAddress';
import EtherscanLinkNFT from '../../ui/links/EtherscanLinkNFT';
import EtherscanLinkToken from '../../ui/links/EtherscanLinkToken';
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
  const {
    treasury: { assetsFungible, assetsNonFungible },
  } = useFractal();

  const fieldUpdate = (value: any, field: string) => {
    dispatch({
      type: CreatorProviderActions.UPDATE_FUNDING,
      payload: {
        [field]: value,
      },
    });
  };

  const onTokenFundChange = (value: BigNumberValuePair, changedTokenIndex: number) => {
    const assets = funding.tokensToFund.map((tokenToFund, i) => {
      if (i === changedTokenIndex) {
        const tokenIndex = assetsFungible.findIndex(
          v => v.tokenAddress === tokenToFund.asset.tokenAddress
        );
        const token = assetsFungible[tokenIndex];
        if (value.bigNumberValue.gte(token.balance)) {
          return {
            ...tokenToFund,
            amount: { value: token.fiatBalance, bigNumberValue: token.balance },
          };
        } else {
          return {
            ...tokenToFund,
            amount: { value: value, bigNumberValue: value.bigNumberValue.toString() },
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
    const asset = assetsFungible[selectedTokenIndex];
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
            value: tokenToFund.asset.fiatBalance,
            bigNumberValue: tokenToFund.asset.balance,
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
    const asset = assetsNonFungible[selectedNFTIndex];
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
              key={tokenToFund.asset.tokenAddress}
            >
              <EtherscanLinkToken address={tokenToFund.asset.tokenAddress}>
                <div className="text-gold-500 w-16 sm:w-28 pl-4">
                  {tokenToFund.asset.token.symbol}
                </div>
              </EtherscanLinkToken>
              <div className="pl-4 text-gray-25 font-medium">{tokenToFund.asset.token.name}</div>
              <div className="pr-4 text-gray-25 font-mono font-semibold tracking-wider text-right">
                {tokenToFund.asset.fiatBalance}
              </div>
              <InputGroup>
                <BigNumberInput
                  value={tokenToFund.amount.bigNumberValue}
                  onChange={tokenAmount => onTokenFundChange(tokenAmount, index)}
                  decimalPlaces={tokenToFund.asset.token.decimals}
                />
                <InputRightElement>
                  <Button
                    variant="text"
                    onClick={() => maxFundToken(index)}
                  >
                    Max
                  </Button>
                </InputRightElement>
              </InputGroup>
              <div onClick={() => removeTokenFund(index)}>
                <CloseSolid />
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
              key={nftToFund.asset.address}
            >
              <div className="flex">
                <EtherscanLinkAddress address={nftToFund.asset.address}>
                  <div className="text-gold-500 truncate ... w-16 sm:w-28">
                    {nftToFund.asset.tokenSymbol}
                  </div>
                </EtherscanLinkAddress>
                <div className="text-gray-25 font-medium">{nftToFund.asset.name}</div>
              </div>
              <div className="text-gray-25 font-mono font-semibold tracking-wider">
                <EtherscanLinkNFT
                  address={nftToFund.asset.address}
                  tokenId={nftToFund.asset.id.toString()}
                >
                  <div className="text-gray-25 font-mono font-semibold tracking-wider">
                    {nftToFund.asset.id.toString()}
                  </div>
                </EtherscanLinkNFT>
              </div>
              <div onClick={() => removeNFTFund(index)}>
                <CloseSolid />
              </div>
            </TableRow>
          ))}
        </div>
      </ContentBox>
    </div>
  );
}
