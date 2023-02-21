import { Box, Radio, Text } from '@chakra-ui/react';

interface IRadioWithText {
  description: string;
  testId: string;
  label: string;
  value?: any;
  disabled?: boolean;
}

export function RadioWithText({ testId, description, label, disabled, value }: IRadioWithText) {
  return (
    <Radio
      display="flex"
      data-testid={testId}
      type="radio"
      disabled={disabled}
      colorScheme="gold"
      borderColor="gold.500"
      size="lg"
      value={value}
    >
      <Box
        ml="4"
        p="0.5rem 1rem"
      >
        <Text
          textStyle="text-base-sans-regular"
          color={disabled ? 'grayscale.400' : 'grayscale.100'}
        >
          {label}
        </Text>
        <Text
          textStyle="text-md-sans-regular"
          color={disabled ? 'grayscale.400' : 'grayscale.500'}
        >
          {description}
        </Text>
      </Box>
    </Radio>
  );
}
