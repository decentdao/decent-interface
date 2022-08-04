import H1 from '../ui/H1';
import { DAOAddress, AddressDisplay } from '../AddressDisplay';
import ContentBox from '../ui/ContentBox';
import ContentBoxTitle from '../ui/ContentBoxTitle';
import InputBox from '../ui/forms/InputBox';
import { useFractal } from '../../providers/fractal/hooks/useFractal';
import { useModuleTypes } from '../../controller/Modules/hooks/useModuleTypes';

function Summary() {
  const { dao, daoLegacy } = useFractal();
  const { timelockModule, treasuryModule, tokenVotingGovernance } = useModuleTypes(
    dao.moduleAddresses
  );

  return (
    <div>
      <H1>{dao.daoName} | Home</H1>
      {daoLegacy.parentDAO && (
        <ContentBox>
          <ContentBoxTitle>Parent DAO</ContentBoxTitle>
          <DAOAddress daoAddress={daoLegacy.parentDAO} />
        </ContentBox>
      )}
      {!!daoLegacy.subsidiaryDAOs.length && (
        <ContentBox>
          <ContentBoxTitle>DAO Subsidiaries</ContentBoxTitle>
          {daoLegacy.subsidiaryDAOs.map(_daoAddress => (
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
            address={dao.daoAddress}
            label="DAO"
          />
        </InputBox>
        <InputBox>
          <AddressDisplay
            address={dao.accessControlAddress}
            label="Access Control"
          />
        </InputBox>
      </ContentBox>
      <ContentBox>
        <ContentBoxTitle>Module Contract Addresses</ContentBoxTitle>
        {treasuryModule && (
          <InputBox>
            <AddressDisplay
              address={treasuryModule.moduleAddress}
              label={treasuryModule.moduleType}
            />
          </InputBox>
        )}
        {tokenVotingGovernance && (
          <InputBox>
            <AddressDisplay
              address={tokenVotingGovernance.moduleAddress}
              label={tokenVotingGovernance.moduleType}
            />
          </InputBox>
        )}
        {timelockModule && (
          <InputBox>
            <AddressDisplay
              address={timelockModule.moduleAddress}
              label={timelockModule.moduleType}
            />
          </InputBox>
        )}
      </ContentBox>
    </div>
  );
}

export default Summary;
