import { Input } from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import ContentBox from '../ui/ContentBox';
import ContentBoxTitle from '../ui/ContentBoxTitle';
import InputBox from '../ui/forms/InputBox';
import { useCreator } from './provider/hooks/useCreator';
import { CreatorProviderActions } from './provider/types';

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
      <InputBox>
        <LabelWrapper
          label={t('labelFractalName')}
          subLabel={t('helperFractalName')}
        >
          <Input
            data-testid="essentials-daoName"
            value={state.essentials.daoName}
            onChange={daoNameChange}
          />
        </LabelWrapper>
      </InputBox>
    </ContentBox>
  );
}

export default DAODetails;
