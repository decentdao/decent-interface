import { Tooltip, TooltipProps } from '@chakra-ui/react';

export function DecentTooltip(props: TooltipProps) {
  return (
    <Tooltip
      hasArrow
      placement="top-start"
      backgroundColor="neutral-9"
      color="black-0"
      {...props}
    />
  );
}
