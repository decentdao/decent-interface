import { useState, useEffect } from 'react';
import { useDAOData } from '../../contexts/daoData';
import ContentBox from '../ui/ContentBox';
import ContentBoxTitle from '../ui/ContentBoxTitle';
import CopyToClipboard from '../ui/CopyToClipboard';
import EtherscanLink from '../ui/EtherscanLink';
import InputBox from '../ui/forms/InputBox';
import H1 from '../ui/H1';

interface AddressDisplayProps {
  address?: string;
  label: string | Promise<string>;
}

function AddressDisplay({ address, label }: AddressDisplayProps) {
  const [lbl, setLbl] = useState('');
  useEffect(() => {
    Promise.resolve(label).then(setLbl);
  }, [label]);

  return (
    <div>
      <div className="text-sm font-medium text-gray-50 pb-1">{lbl}</div>
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
  const [
    {
      name,
      accessControlAddress,
      daoAddress,
      modules: {
        governor: {
          governorModuleContract,
          timelockModuleContract,
          votingToken: { votingTokenData },
        },
        treasury: { treasuryModuleContract },
      },
    },
  ] = useDAOData();

  return (
    <div>
      <H1>{name}</H1>
      <ContentBox>
        <ContentBoxTitle>Core DAO Address</ContentBoxTitle>
        <InputBox>
          <AddressDisplay
            address={daoAddress}
            label="DAO"
          />
        </InputBox>
        <InputBox>
          <AddressDisplay
            address={accessControlAddress}
            label="Access Control"
          />
        </InputBox>
        <ContentBoxTitle>Module Contract Addresses</ContentBoxTitle>
        {treasuryModuleContract && (
          <InputBox>
            <AddressDisplay
              address={treasuryModuleContract.address}
              label={treasuryModuleContract.name()}
            />
          </InputBox>
        )}
        {governorModuleContract && (
          <InputBox>
            <AddressDisplay
              address={governorModuleContract.address}
              label={governorModuleContract.name()}
            />
          </InputBox>
        )}
        {timelockModuleContract && (
          <InputBox>
            <AddressDisplay
              address={timelockModuleContract.address}
              label={timelockModuleContract.name()}
            />
          </InputBox>
        )}
        <ContentBoxTitle>Auxiliary Contracts Addresses</ContentBoxTitle>
        <InputBox>
          <AddressDisplay
            address={votingTokenData.address}
            label="Governance Token"
          />
        </InputBox>
      </ContentBox>
    </div>
  );
}

export default Details;
