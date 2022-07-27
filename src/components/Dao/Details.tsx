import { useDAOData } from '../../contexts/daoData';
import { AddressDisplay, DAOAddress } from '../AddressDisplay';
import ContentBox from '../ui/ContentBox';
import ContentBoxTitle from '../ui/ContentBoxTitle';
import InputBox from '../ui/forms/InputBox';
import H1 from '../ui/H1';

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
        claim: { claimModuleContract },
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
        {claimModuleContract && (
          <InputBox>
            <AddressDisplay
              address={claimModuleContract.address}
              label={claimModuleContract.name()}
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
