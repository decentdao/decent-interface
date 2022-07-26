import Input from '../ui/forms/Input';
import InputBox from '../ui/forms/InputBox';
import ContentBoxTitle from '../ui/ContentBoxTitle';
import ContentBox from '../ui/ContentBox';
import { useCreator } from './provider/hooks/useCreator';
import { ChangeEvent } from 'react';
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
  return (
    <ContentBox>
      <ContentBoxTitle>Essentials</ContentBoxTitle>
      <InputBox>
        <Input
          type="text"
          value={state.essentials.daoName}
          onChange={daoNameChange}
          label="Fractal Name"
          helperText="What is your Fractal called?"
        />
      </InputBox>
    </ContentBox>
  );
}

export default DAODetails;
