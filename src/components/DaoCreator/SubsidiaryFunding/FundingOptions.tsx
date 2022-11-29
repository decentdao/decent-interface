import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';
import ContentBox from '../../ui/ContentBox';
import { PrimaryButton } from '../../ui/forms/Button';
import { NFTToFund, TokenToFund } from './types';

interface IFundingOptions {
  selectedTokenIndex?: number;
  selectedNFTIndex?: number;
  addToken: () => void;
  moveNFT: () => void;
  selectToken: (index?: number) => void;
  selectNFT: () => void;
  tokensToFund: TokenToFund[];
  nftsToFund: NFTToFund[];
}

export function FundingOptions({
  addToken,
  selectToken,
  selectNFT,
  moveNFT,
  tokensToFund,
  nftsToFund,
  selectedTokenIndex,
}: IFundingOptions) {
  const {
    treasury: { assetsFungible, assetsNonFungible },
  } = useFractal();

  const isAddDisabled = useMemo(() => {
    if (selectedTokenIndex === undefined) {
      return true;
    }
    const isEmpty = !assetsFungible.length;
    const isSameLength = assetsFungible.length === tokensToFund.length;
    const asset = assetsFungible[selectedTokenIndex];
    const isAlreadyIncluded = !!tokensToFund.filter(
      token => asset.tokenAddress === token.asset.tokenAddress
    ).length;
    return isEmpty || isAlreadyIncluded || isSameLength;
  }, [tokensToFund, selectedTokenIndex, assetsFungible]);

  const isMoveDisabled = useMemo(() => {
    if (selectedTokenIndex === undefined) {
      return true;
    }
    const isEmpty = !assetsNonFungible.length;
    const isSameLength = assetsNonFungible.length === nftsToFund.length;
    const asset = assetsNonFungible[selectedTokenIndex];
    const isAlreadyIncluded = !!nftsToFund.filter(token => asset.address === token.asset.address)
      .length;
    return isEmpty || isAlreadyIncluded || isSameLength;
  }, [nftsToFund, selectedTokenIndex, assetsNonFungible]);

  const { t } = useTranslation(['common', 'daoCreate']);

  return (
    <ContentBox title={t('titleFundingOptions', { ns: 'daoCreate' })}>
      <div className="flex my-4">
        <select
          className="bg-gray-400 border border-gray-200 px-2 rounded-md w-full focus:outline-none"
          onChange={e => selectToken(e.target.value ? Number(e.target.value) : undefined)}
        >
          <option
            value={undefined}
            label={t('labelSelectToken', { ns: 'daoCreate' })}
            defaultChecked
          />
          {assetsFungible.map((asset, index) => (
            <option
              key={asset.tokenAddress}
              value={index}
              label={`${asset.token.symbol} | ${asset.token.name}`}
            />
          ))}
        </select>
        <PrimaryButton
          label={t('add')}
          onClick={addToken}
          disabled={isAddDisabled}
        />
      </div>
      <div className="flex">
        <select
          className="bg-gray-400 border border-gray-200 px-2 rounded-md w-full focus:outline-none"
          onChange={selectNFT}
        >
          <option
            value={undefined}
            label={t('labelSelectNFT', { ns: 'daoCreate' })}
            defaultChecked
          />
          {assetsNonFungible.map((asset, index) => (
            <option
              key={asset.address}
              value={index}
              label={`${asset.tokenSymbol} | ${asset.tokenName}`}
            />
          ))}
        </select>
        <PrimaryButton
          label={t('move')}
          onClick={moveNFT}
          disabled={isMoveDisabled}
        />
      </div>
    </ContentBox>
  );
}
