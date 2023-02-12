import { Input, HStack, Text, Textarea, Grid, GridItem } from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { BigNumberInput, BigNumberInputProps } from '../ui/forms/BigNumberInput';
import { EthAddressInput } from '../ui/forms/EthAddressInput';

interface BaseProps {
  label: string;
  id?: string;
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
  testId: string;
}

interface EthAddressProps extends Omit<BaseProps, 'children' | 'value'> {
  onAddressChange: (address: string, isValid: boolean) => void;
}

interface TextareaProps extends Omit<BaseProps, 'children'> {
  onChange: React.ChangeEventHandler<HTMLTextAreaElement> | undefined;
  placeholder?: string;
  rows?: number;
}
interface BigNumberProps
  extends Omit<BaseProps, 'children' | 'value'>,
    Omit<BigNumberInputProps, 'isRequired'> {}

export function LabelComponent(props: Omit<BaseProps, 'value' | 'disabled'>) {
  const { label, helper, isRequired, subLabel, errorMessage, children } = props;
  return (
    <Grid
      columnGap={3}
      templateColumns={{ base: '1fr', md: '1fr 2fr' }}
      fontSize="14px"
      alignItems="start"
    >
      <GridItem>
        <HStack
          pb={1}
          textStyle="text-md-sans-regular"
        >
          <Text color="grayscale.100">{label}</Text>
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
  const { id, value, disabled, onChange, placeholder, testId } = props;
  return (
    <LabelComponent {...props}>
      <Input
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        data-testId={testId}
        placeholder={placeholder}
      />
    </LabelComponent>
  );
}

export function EthAddressComponent(props: EthAddressProps) {
  const { id, disabled, onAddressChange } = props;
  return (
    <LabelComponent {...props}>
      <EthAddressInput
        id={id}
        isDisabled={disabled}
        onAddressChange={onAddressChange}
      />
    </LabelComponent>
  );
}

export function TextareaComponent(props: TextareaProps) {
  const { id, value, disabled, onChange, rows, placeholder } = props;
  return (
    <LabelComponent {...props}>
      <Textarea
        id={id}
        resize="none"
        onChange={onChange}
        value={value}
        disabled={disabled}
        rows={rows}
        placeholder={placeholder}
        size="base"
        p="0.5rem 1rem"
      />
    </LabelComponent>
  );
}

export function BigNumberComponent(props: BigNumberProps) {
  const { id, value, disabled, onChange, decimalPlaces } = props;
  return (
    <LabelComponent {...props}>
      <BigNumberInput
        value={value}
        id={id}
        onChange={onChange}
        decimalPlaces={decimalPlaces}
        placeholder="0"
        isDisabled={disabled}
      />
    </LabelComponent>
  );
}
