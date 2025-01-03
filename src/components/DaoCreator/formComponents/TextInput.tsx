import { Input } from '@chakra-ui/react';
import { LabelComponent } from '../../ui/forms/InputComponent';
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
  onValueChange,
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
          onChange={cEvent => onValueChange?.(cEvent.target.value)}
          onBlur={cEvent => onValueChange?.(cEvent.target.value.trim())}
          isDisabled={isDisabled}
          data-testid={testId ?? ''}
          placeholder={placeholder}
          isInvalid={!!error}
        />
      </LabelWrapper>
    </LabelComponent>
  );
}

export function FullWidthTextInput({
  id,
  placeholder,
  error,
  value,
  onChange,
}: ITextInput) {
  return (
    <>
      <LabelWrapper errorMessage={error}>
        <Input
          name={id}
          onChange={cEvent => onChange?.(cEvent)}
          value={value}
          placeholder={placeholder}
          isInvalid={!!error}
          isRequired
        />
      </LabelWrapper>
    </>
  );
}
