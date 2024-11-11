import { Tooltip, TooltipProps } from '@chakra-ui/react';

export function DecentTooltip(props: TooltipProps) {
  return (
    <Tooltip
      maxW="20rem"
      placement="top-start"
      {...props}
      hasArrow
      borderRadius="8px"
      padding="0.25rem 0.5rem"
      color="black-0"
      backgroundColor="neutral-9"
    />
  );
}
