import { useWeb3Provider } from '../../contexts/web3Data/hooks/useWeb3Provider';
import {
  getChainsWithMetadata,
  getChainMetadataById,
  isChainSupportedOnGnosis,
  getSupportedChains,
  GNOSIS_UNSUPPORTED_CHAIN_IDS,
} from '../../contexts/web3Data/chains';
import ContentBox from '../ui/ContentBox';
import { RadioWithText } from '../ui/forms/Radio/RadioWithText';
import { useCreator } from './provider/hooks/useCreator';
import { CreatorProviderActions, GovernanceTypes } from './provider/types';
import { useTranslation } from 'react-i18next';

export function ChooseGovernance() {
  const {
    state: { governance },
    dispatch,
  } = useCreator();
  const {
    state: { chainId },
  } = useWeb3Provider();

  const fieldUpdate = (value: GovernanceTypes) => {
    dispatch({
      type: CreatorProviderActions.UPDATE_GOVERNANCE,
      payload: value,
    });
  };

  const isCurrentChainSupported = isChainSupportedOnGnosis(chainId);
  const currentChainMetadata = getChainMetadataById(chainId);
  const { t } = useTranslation(['daoCreate', 'common']);

  const GNOSIS_UNSUPPORTED_MESSAGE = t('errorGnosisUnsupported', {
    networkName: currentChainMetadata ? currentChainMetadata.name : '',
    supportedNetworks: getChainsWithMetadata(
      getSupportedChains().filter(chain => !GNOSIS_UNSUPPORTED_CHAIN_IDS.includes(chain))
    ).map(chain => ` ${chain.name}`),
  });

  return (
    <ContentBox>
      <div className="md:grid md:grid-cols-2 gap-6 flex flex-col items-center py-4">
        <RadioWithText
          label={t('label1To1Voting')}
          description={t('desc1To1Voting')}
          name="governance"
          id="token-voting"
          isSelected={governance === GovernanceTypes.TOKEN_VOTING_GOVERNANCE}
          onChange={() => {
            fieldUpdate(GovernanceTypes.TOKEN_VOTING_GOVERNANCE);
          }}
          readOnly
        />
        <RadioWithText
          label={t('labelGnosis', { ns: 'common' })}
          description={isCurrentChainSupported ? t('descGnosis') : GNOSIS_UNSUPPORTED_MESSAGE}
          id="gnosis-safe"
          name="governance"
          isSelected={governance === GovernanceTypes.MVD_GNOSIS}
          onChange={() => {
            fieldUpdate(GovernanceTypes.MVD_GNOSIS);
          }}
          disabled={!isCurrentChainSupported}
          readOnly
        />
        <RadioWithText
          label="Pure Gnosis Safe"
          description={
            isCurrentChainSupported
              ? "Create pure Gnosis Safe with no Governance attached (yet). Just a Gnosis Safe. That's it :)"
              : GNOSIS_UNSUPPORTED_MESSAGE
          }
          id="gnosis-safe-pure"
          name="governance"
          isSelected={governance === GovernanceTypes.GNOSIS_SAFE}
          onChange={() => fieldUpdate(GovernanceTypes.GNOSIS_SAFE)}
          disabled={!isCurrentChainSupported}
          readOnly
        />
      </div>
    </ContentBox>
  );
}
