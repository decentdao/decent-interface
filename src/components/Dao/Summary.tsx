import { Link } from 'react-router-dom';
import H1 from '../ui/H1';
import { DAOAddress, AddressDisplay } from '../AddressDisplay';
import ContentBox from '../ui/ContentBox';
import ContentBoxTitle from '../ui/ContentBoxTitle';
import InputBox from '../ui/forms/InputBox';
import { useFractal } from '../../providers/fractal/hooks/useFractal';
import { useTranslation } from 'react-i18next';

function Summary() {
  const {
    mvd: {
      dao,
      daoLegacy,
      modules: {
        timelockModule,
        treasuryModule,
        tokenVotingGovernanceModule,
        claimingContractModule,
        gnosisWrapperModule,
      },
    },
  } = useFractal();
  const { t } = useTranslation(['common', 'dashboard']);

  return (
    <div>
      <H1>
        {dao.daoName} | {t('home')}
      </H1>
      {daoLegacy.parentDAO && (
        <ContentBox>
          <ContentBoxTitle>{t('titleParentDAO')}</ContentBoxTitle>
          <DAOAddress daoAddress={daoLegacy.parentDAO} />
        </ContentBox>
      )}
      {!!daoLegacy.subsidiaryDAOs.length && (
        <ContentBox>
          <ContentBoxTitle>{t('titleDAOSubsidiaries')}</ContentBoxTitle>
          {daoLegacy.subsidiaryDAOs.map(_daoAddress => (
            <DAOAddress
              key={_daoAddress}
              daoAddress={_daoAddress}
            />
          ))}
        </ContentBox>
      )}
      <ContentBox>
        <ContentBoxTitle>{t('titleCoreDAO')}</ContentBoxTitle>
        <InputBox>
          <AddressDisplay
            address={dao.daoAddress}
            label={t('dao')}
          />
        </InputBox>
        <InputBox>
          <AddressDisplay
            address={dao.accessControlAddress}
            label={t('labelAccessControl', { ns: 'dashboard' })}
          />
        </InputBox>
      </ContentBox>
      <ContentBox>
        <ContentBoxTitle>{t('titleModuleContract')}</ContentBoxTitle>
        {treasuryModule && (
          <InputBox>
            <AddressDisplay
              address={treasuryModule.moduleAddress}
              label={treasuryModule.moduleType}
            />
          </InputBox>
        )}
        {tokenVotingGovernanceModule && (
          <InputBox>
            <AddressDisplay
              address={tokenVotingGovernanceModule.moduleAddress}
              label={tokenVotingGovernanceModule.moduleType}
            />
          </InputBox>
        )}
        {claimingContractModule && (
          <InputBox>
            <AddressDisplay
              address={claimingContractModule.moduleAddress}
              label={claimingContractModule.moduleType}
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
        {gnosisWrapperModule && (
          <InputBox>
            <AddressDisplay
              address={gnosisWrapperModule.moduleAddress}
              label={gnosisWrapperModule.moduleType}
            />
          </InputBox>
        )}
      </ContentBox>
    </div>
  );
}

export function GnosisDAOSummary() {
  const {
    gnosis: { safe, modules },
  } = useFractal();
  return (
    <div className="text-white">
      <div>address: {safe.address}</div>
      <div>nonce: {safe.nonce}</div>
      <div>threshold: {safe.threshold}</div>
      <div>owners: {safe.owners?.join(', ')}</div>
      <div>masterCopy: {safe.masterCopy}</div>
      <div>modules: {modules.join(', ')}</div>
      <div>fallbackHandler: {safe.fallbackHandler}</div>
      <div>guard: {safe.guard}</div>
      <div>version: {safe.version}</div>

      <Link to="governance">Governance</Link>
    </div>
  );
}
export default Summary;
