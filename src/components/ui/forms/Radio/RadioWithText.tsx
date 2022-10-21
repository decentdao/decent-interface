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
      value={value}
    >
      <Box
        ml="4"
        p="0.5rem 1rem"
      >
        <Text
          textStyle="text-base-mono-semibold"
          color={disabled ? 'grayscale.300' : 'grayscale.white'}
        >
          {label}
        </Text>
        <Text
          textStyle="text-sm-sans-regular"
          color={disabled ? 'grayscale.300' : 'grayscale.400'}
        >
          {description}
        </Text>
      </Box>
    </Radio>
  );
}
