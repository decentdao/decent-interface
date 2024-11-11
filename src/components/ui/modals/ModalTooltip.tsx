import { Portal, TooltipProps } from '@chakra-ui/react';
import { ReactNode, RefObject } from 'react';
import { DecentTooltip } from '../DecentTooltip';

interface Props extends TooltipProps {
  containerRef: RefObject<HTMLElement | null>;
  children: ReactNode;
}

/**
 * Chakra has some weirdness around displaying Tooltips within modals, so this solution requires
 * wrapping it within a Portal and providing a ref to the Tooltip's container.
 *
 * If you notice Tooltips not displaying within a Chakra Modal, this is the solution!
 *
 * This should have no impact on being placed NOT in a Modal, so if it's necessary to use within
 * a component that isn't necessarily modal only (e.g. CustomNonceInput) you should be fine to use
 * this.
 */
export default function ModalTooltip({ containerRef, children, ...rest }: Props) {
  return (
    <Portal containerRef={containerRef}>
      <DecentTooltip {...rest}>{children}</DecentTooltip>
    </Portal>
  );
}
