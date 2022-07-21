import { useDAOData } from '../../../contexts/daoData';
import ContentBox from '../../ui/ContentBox';
import { PrimaryButton } from '../../ui/forms/Button';

interface IFundingOptions {
  fundToken: () => void;
}

export function FundingOptions({ fundToken }: IFundingOptions) {
  const [
    {
      modules: {
        treasury: { treasuryAssetsFungible, treasuryAssetsNonFungible },
      },
    },
  ] = useDAOData();
  return (
    <ContentBox title="Parent Treasury">
      <div className="flex my-4">
        <select className="bg-gray-400 border border-gray-200 px-2 rounded-md w-full focus:outline-none">
          <option
            value={undefined}
            label="Select Token"
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
          label="Add"
          onClick={fundToken}
        />
      </div>
      <div className="flex">
        <select className="bg-gray-400 border border-gray-200 px-2 rounded-md w-full focus:outline-none">
          <option
            value={undefined}
            label="Select NFT"
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
          label="Move"
          onClick={() => null}
        />
      </div>
    </ContentBox>
  );
}
