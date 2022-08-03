import H1 from '../ui/H1';
import { useDAOData } from '../../contexts/daoData';
import { DAOAddress, AddressDisplay } from '../AddressDisplay';
import ContentBox from '../ui/ContentBox';
import ContentBoxTitle from '../ui/ContentBoxTitle';
import InputBox from '../ui/forms/InputBox';

function Summary() {
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
      {parentDAO && (
        <ContentBox>
          <ContentBoxTitle>Parent DAO</ContentBoxTitle>
          <DAOAddress daoAddress={parentDAO} />
        </ContentBox>
      )}
      {!!subsidiaryDAOs.length && (
        <ContentBox>
          <ContentBoxTitle>DAO Subsidiaries</ContentBoxTitle>
          {subsidiaryDAOs.map(_daoAddress => (
            <DAOAddress
              key={_daoAddress}
              daoAddress={_daoAddress}
            />
          ))}
        </ContentBox>
      )}
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
      </ContentBox>
      <ContentBox>
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
      </ContentBox>
      <ContentBox>
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

export default Summary;
