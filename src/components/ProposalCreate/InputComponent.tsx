import { Input, HStack, Text, Textarea, Grid, GridItem } from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { BigNumberInput, BigNumberInputProps } from '../ui/BigNumberInput';

interface BaseProps {
  label: string;
  helper: string;
  isRequired: boolean;
  value: string;
  disabled: boolean;
  subLabel?: React.ReactNode;
  errorMessage?: string;
  children: React.ReactNode;
}

interface InputProps extends Omit<BaseProps, 'children'> {
  onChange: React.ChangeEventHandler<HTMLInputElement> | undefined;
  placeholder?: string;
}

interface TextareaProps extends Omit<BaseProps, 'children'> {
  onChange: React.ChangeEventHandler<HTMLTextAreaElement> | undefined;
}
interface BigNumberProps
  extends Omit<BaseProps, 'children' | 'value'>,
    Omit<BigNumberInputProps, 'isRequired'> {}

function BaseComponent(props: BaseProps) {
  const { label, helper, isRequired, subLabel, errorMessage, children } = props;
  return (
    <Grid
      columnGap={3}
      templateColumns={{ base: '1fr', md: '1fr 2fr' }}
      fontSize="14px"
      alignItems="start"
    >
      <GridItem>
        <HStack pb={1}>
          <Text>{label}</Text>
          {isRequired && <Text color="gold.500">*</Text>}
        </HStack>
        <Text color="grayscale.500">{helper}</Text>
      </GridItem>
      <GridItem>
        <LabelWrapper
          subLabel={subLabel}
          errorMessage={errorMessage}
        >
          {children}
        </LabelWrapper>
      </GridItem>
    </Grid>
  );
}

export function InputComponent(props: InputProps) {
  const { value, disabled, onChange, placeholder } = props;
  return (
    <BaseComponent {...props}>
      <Input
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
      />
    </BaseComponent>
  );
}

export function TextareaComponent(props: TextareaProps) {
  const { value, disabled, onChange } = props;
  return (
    <BaseComponent {...props}>
      <Textarea
        resize="none"
        onChange={onChange}
        value={value}
        disabled={disabled}
      />
    </BaseComponent>
  );
}

export function BigNumberComponent(props: BigNumberProps) {
  const { value, disabled, onChange, decimalPlaces } = props;
  return (
    <BaseComponent
      {...props}
      value={''}
    >
      <BigNumberInput
        value={value}
        onChange={onChange}
        decimalPlaces={decimalPlaces}
        placeholder="0"
        isDisabled={disabled}
      />
    </BaseComponent>
  );
}
