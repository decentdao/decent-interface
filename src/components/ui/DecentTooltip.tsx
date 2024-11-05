import { Tooltip, TooltipProps } from '@chakra-ui/react';

export function DecentTooltip(props: TooltipProps) {
  return (
    <Tooltip
      maxW="20rem"
      hasArrow
      borderRadius="8px"
      placement="top-start"
      backgroundColor="neutral-9"
      color="black-0"
      padding="0.25rem 0.5rem"
      {...props}
    />
  );
}
