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
import { Divider, RadioGroup } from '@chakra-ui/react';

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
          label={t('label1To1Voting')}
          description={t('desc1To1Voting')}
          testId="choose-tokenVotingMVD"
          value={GovernanceTypes.TOKEN_VOTING_GOVERNANCE}
        />
        <Divider />
        <RadioWithText
          label={t('labelGnosis', { ns: 'common' })}
          description={isCurrentChainSupported ? t('descGnosis') : GNOSIS_UNSUPPORTED_MESSAGE}
          testId="choose-gnosisSafeMVD"
          value={GovernanceTypes.MVD_GNOSIS}
          disabled={!isCurrentChainSupported}
        />
        <Divider />
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
