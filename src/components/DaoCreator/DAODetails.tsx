import InputBox from '../ui/forms/InputBox';
import ContentBoxTitle from '../ui/ContentBoxTitle';
import ContentBox from '../ui/ContentBox';
import { useCreator } from './provider/hooks/useCreator';
import { ChangeEvent } from 'react';
import { CreatorProviderActions } from './provider/types';
import { useTranslation } from 'react-i18next';
import { Input, LabelWrapper } from '@decent-org/fractal-ui';

function DAODetails() {
  const { state, dispatch } = useCreator();

  const daoNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: CreatorProviderActions.UPDATE_ESSENTIALS,
      payload: {
        daoName: e.target.value,
      },
    });
  };
  const { t } = useTranslation('daoCreate');

  return (
    <ContentBox>
      <ContentBoxTitle>Essentials</ContentBoxTitle>
      <InputBox>
        <LabelWrapper
          label={t('labelFractalName')}
          subLabel={t('helperFractalName')}
        >
          <Input
            data-testid="essentials-daoName"
            type="text"
            size="base"
            w="100%"
            value={state.essentials.daoName}
            onChange={daoNameChange}
          />
        </LabelWrapper>
      </InputBox>
    </ContentBox>
  );
}

export default DAODetails;
