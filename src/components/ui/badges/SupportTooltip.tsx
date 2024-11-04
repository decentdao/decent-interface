import { TooltipProps, Icon } from '@chakra-ui/react';
import { Icon as PhosphorIcon, Question } from '@phosphor-icons/react';
import { RefObject } from 'react';
import { TOOLTIP_MAXW } from '../../../constants/common';
import { DecentTooltip } from '../DecentTooltip';
import ModalTooltip from '../modals/ModalTooltip';

interface Props extends Omit<TooltipProps, 'children'> {
  containerRef?: RefObject<HTMLElement | null>;
  IconComponent?: PhosphorIcon;
}

/**
 * Displays a circle in question mark, along with the provided tooltip, via
 * the 'label' Tooltip prop.
 */
export default function SupportTooltip({ containerRef, IconComponent, ...rest }: Props) {
  const icon = (
    <Icon
      boxSize="1.5rem"
      minWidth="auto"
      color={rest.color}
      as={IconComponent || Question}
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
        {icon}
      </ModalTooltip>
    );
  }

  return (
    <DecentTooltip
      maxW={TOOLTIP_MAXW}
      placement="top"
      {...rest}
      color="white"
    >
      {icon}
    </DecentTooltip>
  );
}
