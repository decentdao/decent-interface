import { Input } from '@chakra-ui/react';
import { InputComponent, LabelComponent } from '../../ui/forms/InputComponent';
import LabelWrapper from '../../ui/forms/LabelWrapper';
import { ITextInput } from '../presenters/CreateDAOPresenter';

export function TextInput({
  id,
  label,
  description,
  placeholder,
  error,
  value,
  isDisabled = false,
  isRequired,
  testId,
  onChange,
}: ITextInput) {
  return (
    <LabelComponent
      label={label}
      helper={description}
      isRequired={isRequired}
    >
      <LabelWrapper errorMessage={error}>
        <Input
          id={id}
          value={value}
          onChange={cEvent => onChange(cEvent.target.value)}
          onBlur={cEvent => onChange(cEvent.target.value.trim())}
          isDisabled={isDisabled}
          data-testid={testId ?? ''}
          placeholder={placeholder}
          isInvalid={!!error}
        />
      </LabelWrapper>
    </LabelComponent>
  );
}
