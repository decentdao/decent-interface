import { useDAOData } from '../../contexts/daoData';
import ContentBox from '../ui/ContentBox';
import ContentBoxTitle from '../ui/ContentBoxTitle';
import CopyToClipboard from '../ui/CopyToClipboard';
import EtherscanLink from '../ui/EtherscanLink';
import InputBox from '../ui/forms/InputBox';
import H1 from '../ui/H1';

interface AddressDisplayProps {
  address?: string;
  label: string;
}

function AddressDisplay({ address, label }: AddressDisplayProps) {
  return (
    <div>
      <div className="text-sm font-medium text-gray-50 pb-1">{label}</div>
      <div className="flex items-center">
        <EtherscanLink address={address}>
          <div className="text-gold-500 hover:text-gold-300 font-semibold tracking-wider font-mono break-all">
            {address}
          </div>
        </EtherscanLink>
        <CopyToClipboard textToCopy={address} />
      </div>
    </div>
  );
}

function Details() {
  const [{ name, accessControlAddress, moduleAddresses, tokenData, daoAddress }] = useDAOData();

  return (
    <div>
      <H1>{name}</H1>
      <ContentBox>
        <ContentBoxTitle>DAO Address</ContentBoxTitle>
        <InputBox>
          <AddressDisplay
            address={daoAddress}
            label=""
          />
        </InputBox>
        <ContentBoxTitle>DAO Contracts Addresses</ContentBoxTitle>
        <InputBox>
          <AddressDisplay
            address={accessControlAddress}
            label="Access Control Address:"
          />
        </InputBox>
        <InputBox>
          <AddressDisplay
            address={tokenData.address}
            label="Governance Token Address:"
          />
        </InputBox>

        {moduleAddresses && moduleAddresses.length && (
          <>
            <ContentBoxTitle>Module Contract Addresses</ContentBoxTitle>
            <InputBox>
              <AddressDisplay
                address={moduleAddresses[0]}
                label="Treasury Module Address:"
              />
            </InputBox>
            <InputBox>
              <AddressDisplay
                address={moduleAddresses[1]}
                label="Governor Module Address:"
              />
            </InputBox>
            <InputBox>
              <AddressDisplay
                address={moduleAddresses[2]}
                label="Timelock Controller Module Address:"
              />
            </InputBox>
          </>
        )}
      </ContentBox>
    </div>
  );
}

export default Details;
