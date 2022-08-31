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

  return (
    <ContentBox>
      <div className="md:grid md:grid-cols-2 gap-6 flex flex-col items-center py-4">
        <RadioWithText
          label="1:1 Token Voting"
          description="Governance with tokens giving voting power to token holders."
          name="governance"
          id="token-voting"
          isSelected={governance === GovernanceTypes.TOKEN_VOTING_GOVERNANCE}
          onChange={() => {
            fieldUpdate(GovernanceTypes.TOKEN_VOTING_GOVERNANCE);
          }}
          readOnly
        />
        <RadioWithText
          label="Gnosis Safe"
          description={
            isCurrentChainSupported
              ? 'Gnosis Powered, Multi-signature governance allows you define an access/control-scheme through multiple signers that need to confirm transactions'
              : `Unfortunately, Gnosis does not support network ${
                  currentChainMetadata ? currentChainMetadata.name : ''
                } you are using right now. Consider switching to one of the following networks: ${getChainsWithMetadata(
                  getSupportedChains().filter(
                    chain => !GNOSIS_UNSUPPORTED_CHAIN_IDS.includes(chain)
                  )
                ).map(chain => ` ${chain.name}`)}`
          }
          id="gnosis-safe"
          name="governance"
          isSelected={governance === GovernanceTypes.GNOSIS_SAFE}
          onChange={() => {
            fieldUpdate(GovernanceTypes.GNOSIS_SAFE);
          }}
          disabled={!isCurrentChainSupported}
          readOnly
        />
      </div>
    </ContentBox>
  );
}
