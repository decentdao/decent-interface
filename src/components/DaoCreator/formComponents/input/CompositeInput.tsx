import { Flex } from '@chakra-ui/react';
import { PropsWithChildren } from 'react';
import { LabelComponent } from '../../../ui/forms/InputComponent';
import LabelWrapper from '../../../ui/forms/LabelWrapper';
import { IInput } from '../../presenters/CreateDAOPresenter';

export function MultiInputs(
  { label, description, isRequired, error }: IInput,
  { children }: PropsWithChildren<{}>,
) {
  return (
    <LabelComponent
      label={label}
      helper={description}
      isRequired={isRequired}
    >
      <LabelWrapper errorMessage={error}>
        <Flex
          flexDirection="column"
          gap={2}
        >
          {children}
        </Flex>
      </LabelWrapper>
    </LabelComponent>
  );
}
