import {
  Input,
  HStack,
  Text,
  Textarea,
  Grid,
  GridItem,
  GridProps,
  GridItemProps,
} from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { BigNumberInput, BigNumberInputProps } from './BigNumberInput';
import { EthAddressInput } from './EthAddressInput';

interface BaseProps {
  label: string;
  id?: string;
  helper: string;
  isRequired: boolean;
  value: string;
  disabled?: boolean;
  subLabel?: React.ReactNode;
  errorMessage?: string;
  children: React.ReactNode;
  gridContainerProps?: GridProps;
  inputContainerProps?: GridItemProps;
  maxLength?: number;
}

interface InputProps extends Omit<BaseProps, 'children'> {
  onChange: React.ChangeEventHandler<HTMLInputElement> | undefined;
  onBlur?: React.ChangeEventHandler<HTMLInputElement> | undefined;
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

export function LabelComponent(props: Omit<BaseProps, 'value'>) {
  const {
    label,
    helper,
    isRequired,
    subLabel,
    errorMessage,
    children,
    gridContainerProps,
    inputContainerProps,
    disabled,
  } = props;
  return (
    <Grid
      columnGap={3}
      templateColumns={{ base: '1fr', md: '1fr 2fr' }}
      fontSize="14px"
      alignItems="start"
      cursor={disabled ? 'not-allowed' : 'pointer'}
      {...gridContainerProps}
    >
      <GridItem>
        <HStack
          pb={1}
          textStyle="text-md-sans-regular"
        >
          <Text color={disabled ? 'grayscale.500' : 'grayscale.100'}>{label}</Text>
          {isRequired && <Text color="gold.500">*</Text>}
        </HStack>
        <Text color="grayscale.500">{helper}</Text>
      </GridItem>
      <GridItem {...inputContainerProps}>
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
  const { id, value, disabled, onChange, onBlur, placeholder, testId, maxLength } = props;
  return (
    <LabelComponent
      {...props}
      disabled={disabled}
    >
      <Input
        id={id}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        isDisabled={disabled}
        data-testid={testId}
        placeholder={placeholder}
        maxLength={maxLength}
      />
    </LabelComponent>
  );
}

export function EthAddressComponent(props: EthAddressProps) {
  const { id, disabled, onAddressChange } = props;
  return (
    <LabelComponent
      {...props}
      disabled={disabled}
    >
      <EthAddressInput
        id={id}
        isDisabled={disabled}
        onAddressChange={onAddressChange}
      />
    </LabelComponent>
  );
}

export function TextareaComponent(props: TextareaProps) {
  const { id, value, disabled, onChange, rows, placeholder, maxLength } = props;
  return (
    <LabelComponent
      {...props}
      disabled={disabled}
    >
      <Textarea
        id={id}
        resize="none"
        onChange={onChange}
        value={value}
        isDisabled={disabled}
        rows={rows}
        placeholder={placeholder}
        borderColor="black.400"
        size="base"
        p="0.5rem 1rem"
        maxLength={maxLength}
      />
    </LabelComponent>
  );
}

export function BigNumberComponent(props: BigNumberProps) {
  const { id, value, disabled, onChange, decimalPlaces } = props;
  return (
    <LabelComponent
      {...props}
      disabled={disabled}
    >
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
