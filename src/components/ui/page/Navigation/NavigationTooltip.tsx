import { Center } from '@chakra-ui/react';
import { DecentTooltip } from '../../DecentTooltip';

export function NavigationTooltip({ label, children }: { label: string; children: JSX.Element }) {
  return (
    <Center>
      <DecentTooltip
        closeDelay={250}
        gutter={10}
        hasArrow
        label={label}
        placement="right"
      >
        {children}
      </DecentTooltip>
    </Center>
  );
}
