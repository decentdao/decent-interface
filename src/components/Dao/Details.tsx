import { useState, useEffect } from 'react';
import { useDAOData } from '../../contexts/daoData';
import useDAOContract from '../../contexts/daoData/useDAOContract';
import useDAOName from '../../contexts/daoData/useDAOName';
import ContentBox from '../ui/ContentBox';
import ContentBoxTitle from '../ui/ContentBoxTitle';
import CopyToClipboard from '../ui/CopyToClipboard';
import EtherscanLinkAddress from '../ui/EtherscanLinkAddress';
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
        <EtherscanLinkAddress address={address}>
          <div className="text-gold-500 hover:text-gold-300 font-semibold tracking-wider font-mono break-all">
            {address}
          </div>
        </EtherscanLinkAddress>
        <CopyToClipboard textToCopy={address} />
      </div>
    </div>
  );
}

function DAOAddress({ daoAddress }: { daoAddress: string }) {
  const daoContract = useDAOContract(daoAddress);
  const name = useDAOName(daoContract);

  if (!name) {
    return null;
  }
  return (
    <InputBox>
      <AddressDisplay
        address={daoAddress}
        label={name}
      />
    </InputBox>
  );
}

function Details() {
  const [
    {
      name,
      accessControlAddress,
      daoAddress,
      parentDAO,
      subsidiaryDAOs,
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
        {parentDAO && (
          <>
            <ContentBoxTitle>Parent DAO</ContentBoxTitle>
            <DAOAddress daoAddress={parentDAO} />
          </>
        )}
        {!!subsidiaryDAOs.length && <ContentBoxTitle>DAO Subsidiaries</ContentBoxTitle>}
        {subsidiaryDAOs.map(_daoAddress => (
          <DAOAddress
            key={_daoAddress}
            daoAddress={_daoAddress}
          />
        ))}
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
