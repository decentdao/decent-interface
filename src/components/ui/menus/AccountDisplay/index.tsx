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
      offset={[0, 4]}
    >
      <Button
        as={MenuButton}
        variant="tertiary"
        data-testid="header-accountMenu"
        padding="0.25rem"
        color="white-0"
        border="1px solid transparent"
        borderRadius="0.5rem"
        _hover={{ color: 'white-0', bg: 'neutral-3' }}
        _active={{
          color: 'white-0',
          border: '1px solid',
          borderColor: 'neutral-4',
          bg: 'neutral-3',
        }}
      >
        <AccountMenuButton />
      </Button>

      <Portal containerRef={containerRef}>
        <WalletMenu containerRef={containerRef} />
      </Portal>
    </Menu>
  );
}
