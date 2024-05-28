import { Box, Flex, FormLabel, Text, Tooltip } from '@chakra-ui/react';
import { Info } from '@phosphor-icons/react';
import { ReactNode } from 'react';

export interface ILabelWrapper {
  label?: string;
  subLabel?: ReactNode;
  isDisabled?: boolean;
  errorMessage?: string;
  tooltipContent?: JSX.Element;
  htmlFor?: string;
  children: JSX.Element;
}

// @todo move to UI components
function LabelWrapper({ label, subLabel, errorMessage, tooltipContent, children }: ILabelWrapper) {
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
          textStyle="helper-text"
          color="neutral-7"
          mt="2"
        >
          <Text color="red-0">{errorMessage}</Text>
          {!!subLabel && subLabel}
        </Box>
      </FormLabel>
    </Box>
  );
}

LabelWrapper.displayName = 'LabelWrapper';
export default LabelWrapper;
