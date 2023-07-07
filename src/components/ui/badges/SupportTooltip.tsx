import { Tooltip, TooltipProps } from '@chakra-ui/react';
import { SupportQuestion } from '@decent-org/fractal-ui';
import { RefObject } from 'react';
import { TOOLTIP_MAXW } from '../../../constants/common';
import ModalTooltip from '../modals/ModalTooltip';

interface Props extends Omit<TooltipProps, 'children'> {
  containerRef?: RefObject<HTMLElement | null>;
}

/**
 * Displays a circle in question mark, along with the provided tooltip, via
 * the 'label' Tooltip prop.
 */
export default function SupportTooltip({ containerRef, ...rest }: Props) {
  const question = (
    <SupportQuestion
      boxSize="1.5rem"
      minWidth="auto"
      color={rest.color}
    />
  );

  if (containerRef) {
    return (
      <ModalTooltip
        containerRef={containerRef}
        maxW={TOOLTIP_MAXW}
        placement="top"
        {...rest}
      >
        {question}
      </ModalTooltip>
    );
  }

  return (
    <Tooltip
      maxW={TOOLTIP_MAXW}
      placement="top"
      {...rest}
      color="white"
    >
      {question}
    </Tooltip>
  );
}
