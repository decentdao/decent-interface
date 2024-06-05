import { Box, Flex, FormLabel, Text, Tooltip } from '@chakra-ui/react';
import { Info } from '@phosphor-icons/react';

// @todo there is some type cleanup needed here
export interface LabelWrapperProps {
  label?: string;
  subLabel?: JSX.Element | string | null;
  isDisabled?: boolean;
  errorMessage?: string | null;
  tooltipContent?: JSX.Element;
  htmlFor?: string;
  children: JSX.Element | JSX.Element[];
}

function LabelWrapper({
  label,
  subLabel,
  errorMessage,
  tooltipContent,
  children,
}: LabelWrapperProps) {
  return (
    <Box position="relative">
      <FormLabel m="0px">
        <Flex
          gap="2"
          alignItems="center"
          h="fit-content"
          color="white-0"
          mb="2"
          textStyle="label-base"
        >
          <Text>{label}</Text>
          {!!tooltipContent && (
            <Tooltip
              hasArrow
              label={tooltipContent}
              closeDelay={500}
            >
              <Info />
            </Tooltip>
          )}
        </Flex>
        {children}
        <Box
          textStyle="helper-text-base"
          color="neutral-7"
          mt="2"
        >
          {errorMessage && (
            <Text
              color="red-0"
              mb="0.25rem"
            >
              {errorMessage}
            </Text>
          )}
          {!!subLabel && subLabel}
        </Box>
      </FormLabel>
    </Box>
  );
}

LabelWrapper.displayName = 'LabelWrapper';
export default LabelWrapper;
