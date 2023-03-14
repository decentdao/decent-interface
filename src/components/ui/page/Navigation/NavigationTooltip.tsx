import { Center, Tooltip } from '@chakra-ui/react';

export function NavigationTooltip({ label, children }: { label: string; children: JSX.Element }) {
  return (
    <Center>
      <Tooltip
        closeDelay={250}
        gutter={10}
        hasArrow
        label={label}
        placement="right"
      >
        {children}
      </Tooltip>
    </Center>
  );
}
