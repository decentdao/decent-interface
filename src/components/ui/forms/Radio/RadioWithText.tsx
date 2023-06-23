import { Box, HStack, Radio, Text } from '@chakra-ui/react';
import SupportTooltip from '../../badges/SupportTooltip';

interface IRadioWithText {
  description: string;
  testId: string;
  label: string;
  value?: any;
  disabled?: boolean;
  onClick?: () => void;
  tooltip?: React.ReactNode;
}

export function RadioWithText({
  testId,
  description,
  label,
  disabled,
  value,
  onClick,
  tooltip,
}: IRadioWithText) {
  return (
    <Box onClick={onClick}>
      <Radio
        display="flex"
        data-testid={testId}
        type="radio"
        isDisabled={disabled}
        colorScheme="gold"
        borderColor="gold.500"
        size="lg"
        value={value}
      >
        <Box
          ml="4"
          p="0.5rem 1rem"
        >
          <HStack>
            <Text
              textStyle="text-base-sans-regular"
              color={disabled ? 'grayscale.400' : 'grayscale.100'}
            >
              {label}
            </Text>
            {tooltip && (
              <SupportTooltip
                label={tooltip}
                closeDelay={1000}
                pointerEvents={'all'}
              />
            )}
          </HStack>
          <Text
            textStyle="text-md-sans-regular"
            color={disabled ? 'grayscale.400' : 'grayscale.500'}
          >
            {description}
          </Text>
        </Box>
      </Radio>
    </Box>
  );
}
