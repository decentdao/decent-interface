import {
  Button,
  HStack,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
} from '@chakra-ui/react';
import { Plus, Minus } from '@phosphor-icons/react';

export function NumberStepperInput({
  value,
  onChange,
}: {
  value?: string | number;
  onChange: (val: string) => void;
}) {
  const stepperButton = (direction: 'inc' | 'dec') => (
    <Button
      variant="secondary"
      borderColor="neutral-3"
      p="0.5rem"
      size="md"
    >
      {direction === 'inc' ? <Plus size="1.5rem" /> : <Minus size="1.5rem" />}
    </Button>
  );

  return (
    <NumberInput
      value={value}
      onChange={onChange}
      min={0}
      focusInputOnChange
      w="100%"
    >
      <HStack gap="0.25rem">
        <NumberDecrementStepper>{stepperButton('dec')}</NumberDecrementStepper>
        <NumberInputField min={0} />
        <NumberIncrementStepper>{stepperButton('inc')}</NumberIncrementStepper>
      </HStack>
    </NumberInput>
  );
}
