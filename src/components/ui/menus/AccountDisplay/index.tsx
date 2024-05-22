import { Button, Menu, MenuButton, Portal } from '@chakra-ui/react';
import { RefObject } from 'react';
import { AccountMenuButton } from './AccountMenuButton';
import { WalletMenu } from './WalletMenu';

interface AccountDisplayProps {
  containerRef: RefObject<HTMLDivElement | null>;
}

export function AccountDisplay({ containerRef }: AccountDisplayProps) {
  return (
    // Portal here needed in order to
    <Menu
      placement="bottom-end"
      offset={[0, 16]}
    >
      <Button
        as={MenuButton}
        variant="tertiary"
        data-testid="header-accountMenu"
        px="0.5rem"
      >
        <AccountMenuButton />
      </Button>

      <Portal containerRef={containerRef}>
        <WalletMenu containerRef={containerRef} />
      </Portal>
    </Menu>
  );
}
