import ContentBox from '../ui/ContentBox';
import { RadioWithText } from '../ui/forms/Radio/RadioWithText';
import { useCreator } from './provider/hooks/useCreator';
import { CreatorProviderActions, GovernanceTypes } from './provider/types';

export function ChooseGovernance() {
  const {
    state: { governance },
    dispatch,
  } = useCreator();

  const fieldUpdate = (value: any) => {
    dispatch({
      type: CreatorProviderActions.UPDATE_GOVERNANCE,
      payload: value,
    });
  };

  return (
    <div>
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
            description="Gnosis Powered, Multi-signature governance allows you define an access/control-scheme through multiple signers that need to confirm transactions"
            id="gnosis-safe"
            name="governance"
            isSelected={governance === GovernanceTypes.GNOSIS_SAFE}
            onChange={() => {
              fieldUpdate(GovernanceTypes.GNOSIS_SAFE);
            }}
            readOnly
          />
        </div>
      </ContentBox>
    </div>
  );
}
