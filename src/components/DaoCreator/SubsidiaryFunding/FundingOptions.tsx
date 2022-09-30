import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTreasuryInjector } from '../../../controller/Modules/injectors/TreasuryInjectorContext';
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
  const { treasuryAssetsFungible, treasuryAssetsNonFungible } = useTreasuryInjector();

  const isAddDisabled = useMemo(() => {
    if (selectedTokenIndex === undefined) {
      return true;
    }
    const isEmpty = !treasuryAssetsFungible.length;
    const isSameLength = treasuryAssetsFungible.length === tokensToFund.length;
    const asset = treasuryAssetsFungible[selectedTokenIndex];
    const isAlreadyIncluded = !!tokensToFund.filter(
      token => asset.contractAddress === token.asset.contractAddress
    ).length;
    return isEmpty || isAlreadyIncluded || isSameLength;
  }, [tokensToFund, selectedTokenIndex, treasuryAssetsFungible]);

  const isMoveDisabled = useMemo(() => {
    if (selectedTokenIndex === undefined) {
      return true;
    }
    const isEmpty = !treasuryAssetsNonFungible.length;
    const isSameLength = treasuryAssetsNonFungible.length === nftsToFund.length;
    const asset = treasuryAssetsNonFungible[selectedTokenIndex];
    const isAlreadyIncluded = !!nftsToFund.filter(
      token => asset.contractAddress === token.asset.contractAddress
    ).length;
    return isEmpty || isAlreadyIncluded || isSameLength;
  }, [nftsToFund, selectedTokenIndex, treasuryAssetsNonFungible]);

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
          {treasuryAssetsFungible.map((asset, index) => (
            <option
              key={asset.contractAddress}
              value={index}
              label={`${asset.symbol} | ${asset.name}`}
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
          {treasuryAssetsNonFungible.map((asset, index) => (
            <option
              key={asset.contractAddress}
              value={index}
              label={`${asset.symbol} | ${asset.name}`}
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
