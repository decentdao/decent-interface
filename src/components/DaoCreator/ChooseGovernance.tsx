import { Divider, RadioGroup } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import ContentBox from '../ui/ContentBox';
import { RadioWithText } from '../ui/forms/Radio/RadioWithText';
import { useCreator } from './provider/hooks/useCreator';
import { CreatorProviderActions, GovernanceTypes } from './provider/types';

export function ChooseGovernance() {
  const {
    state: { governance },
    dispatch,
  } = useCreator();

  const fieldUpdate = (value: GovernanceTypes) => {
    dispatch({
      type: CreatorProviderActions.UPDATE_GOVERNANCE,
      payload: value,
    });
  };

  const { t } = useTranslation('daoCreate');

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
          label={t('labelMultisigGov')}
          description={t('descMultisigGov')}
          testId="choose-multisig"
          value={GovernanceTypes.GNOSIS_SAFE}
        />
        <Divider />
        <RadioWithText
          label={t('labelUsulGov')}
          description={t('descUsulGov')}
          testId="choose-usul"
          value={GovernanceTypes.GNOSIS_SAFE_USUL}
        />
      </RadioGroup>
    </ContentBox>
  );
}
