import { Divider, RadioGroup } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import {
  GNOSIS_UNSUPPORTED_CHAIN_IDS,
  getChainMetadataById,
  getChainsWithMetadata,
  getSupportedChains,
  isChainSupportedOnGnosis,
} from '../../providers/web3Data/chains';
import { useWeb3Provider } from '../../providers/web3Data/hooks/useWeb3Provider';
import ContentBox from '../ui/ContentBox';
import { RadioWithText } from '../ui/forms/Radio/RadioWithText';
import { useCreator } from './provider/hooks/useCreator';
import { CreatorProviderActions, GovernanceTypes } from './provider/types';

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
      <RadioGroup
        display="flex"
        flexDirection="column"
        name="governance"
        gap="4"
        py="0.5rem"
        value={governance}
        onChange={selectedGovernance => {
          fieldUpdate(selectedGovernance as GovernanceTypes);
        }}
      >
        <RadioWithText
          label={t('labelPureGnosis', { ns: 'common' })}
          description={isCurrentChainSupported ? t('descPureGnosis') : GNOSIS_UNSUPPORTED_MESSAGE}
          testId="choose-gnosisSafePure"
          value={GovernanceTypes.GNOSIS_SAFE}
          disabled={!isCurrentChainSupported}
        />
        <Divider />
        <RadioWithText
          label={t('labelGnosisWithUsul', { ns: 'common' })}
          description={isCurrentChainSupported ? t('descGnosisUsul') : GNOSIS_UNSUPPORTED_MESSAGE}
          testId="choose-gnosis-safe-usul"
          value={GovernanceTypes.GNOSIS_SAFE_USUL}
          disabled={!isCurrentChainSupported}
        />
      </RadioGroup>
    </ContentBox>
  );
}
